-- ============================================================================
-- SISTEMA DE GESTIÓN DE RESERVAS - CABAÑAS PUERTO IGUAZÚ (EJÉRCITO ARGENTINO)
-- Migración 0001: esquema base
-- ----------------------------------------------------------------------------
-- Ejecutar en Supabase > SQL Editor (pegar completo y presionar RUN).
-- Es idempotente: puede ejecutarse más de una vez sin errores.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 0. Extensiones
-- ----------------------------------------------------------------------------
-- btree_gist permite combinar igualdad de uuid con solapamiento de rangos
-- dentro de una misma restricción de exclusión (anti-superposición).
create extension if not exists btree_gist;

-- ----------------------------------------------------------------------------
-- 1. Tipos enumerados
-- ----------------------------------------------------------------------------
do $$
begin
  if not exists (select 1 from pg_type where typname = 'estado_reserva') then
    create type public.estado_reserva as enum
      ('pendiente', 'confirmada', 'finalizada', 'cancelada');
  end if;

  if not exists (select 1 from pg_type where typname = 'procedencia_huesped') then
    create type public.procedencia_huesped as enum
      ('personal_militar', 'civil');
  end if;
end
$$;

-- ----------------------------------------------------------------------------
-- 2. Tabla: cabanas
-- ----------------------------------------------------------------------------
-- La capacidad se deja en NULL a propósito: no se inventan valores iniciales.
-- El administrador debe configurar la capacidad máxima de cada cabaña.
create table if not exists public.cabanas (
  id          uuid primary key default gen_random_uuid(),
  nombre      text not null,
  capacidad   integer,
  descripcion text,
  activa      boolean not null default true,
  created_at  timestamptz not null default now(),

  constraint cabanas_nombre_unico
    unique (nombre),
  constraint cabanas_nombre_no_vacio
    check (length(btrim(nombre)) > 0),
  constraint cabanas_capacidad_valida
    check (capacidad is null or capacidad between 1 and 50)
);

comment on table public.cabanas is
  'Cabañas gestionadas por el sistema (4 en total).';
comment on column public.cabanas.capacidad is
  'Capacidad máxima de huéspedes. NULL = pendiente de configurar por el administrador.';

-- ----------------------------------------------------------------------------
-- 3. Tabla: reservas
-- ----------------------------------------------------------------------------
-- Convención de fechas: la reserva ocupa la cabaña desde fecha_ingreso
-- (inclusive) hasta fecha_salida (EXCLUSIVA). Ej.: ingreso 10/12 y salida 15/12
-- ocupan las noches del 10, 11, 12, 13 y 14 de diciembre.
create table if not exists public.reservas (
  id                 uuid primary key default gen_random_uuid(),
  cabana_id          uuid not null
                       references public.cabanas (id)
                       on update cascade
                       on delete restrict,
  nombre_huesped     text not null,
  dni                text not null,
  telefono           text not null,
  procedencia        public.procedencia_huesped not null,
  cantidad_huespedes integer not null,
  fecha_ingreso      date not null,
  fecha_salida       date not null,
  estado             public.estado_reserva not null default 'pendiente',
  observaciones      text,
  created_at         timestamptz not null default now(),
  updated_at         timestamptz not null default now(),

  constraint reservas_fechas_validas
    check (fecha_salida > fecha_ingreso),
  constraint reservas_nombre_valido
    check (length(btrim(nombre_huesped)) >= 3),
  constraint reservas_dni_valido
    check (dni ~ '^[0-9]{7,9}$'),
  constraint reservas_telefono_valido
    check (length(btrim(telefono)) >= 6),
  constraint reservas_cantidad_valida
    check (cantidad_huespedes >= 1)
);

comment on table public.reservas is
  'Reservas de las cabañas. Las reservas canceladas se conservan para el historial.';
comment on constraint reservas_fechas_validas on public.reservas is
  'La fecha de salida debe ser posterior a la fecha de ingreso.';

-- ----------------------------------------------------------------------------
-- 4. Tabla: usuarios_administradores
-- ----------------------------------------------------------------------------
-- Vincula la identidad del administrador con Supabase Auth.
-- NO se almacenan contraseñas: las gestiona exclusivamente auth.users.
create table if not exists public.usuarios_administradores (
  id         uuid primary key references auth.users (id) on delete cascade,
  correo     text not null,
  nombre     text,
  created_at timestamptz not null default now(),

  constraint usuarios_administradores_correo_unico unique (correo)
);

comment on table public.usuarios_administradores is
  'Administradores autorizados. Vinculado a auth.users, sin guardar contraseñas.';

-- ----------------------------------------------------------------------------
-- 5. Índices
-- ----------------------------------------------------------------------------
create index if not exists reservas_cabana_id_idx on public.reservas (cabana_id);
create index if not exists reservas_fechas_idx    on public.reservas (fecha_ingreso, fecha_salida);
create index if not exists reservas_estado_idx    on public.reservas (estado);
create index if not exists reservas_dni_idx       on public.reservas (dni);
create index if not exists reservas_nombre_idx    on public.reservas (lower(nombre_huesped));

-- ----------------------------------------------------------------------------
-- 6. Prevención de reservas superpuestas (garantía en PostgreSQL)
-- ----------------------------------------------------------------------------
-- Restricción de exclusión: dos reservas NO canceladas de la misma cabaña
-- no pueden solaparse en el rango [fecha_ingreso, fecha_salida).
-- El rango es '[)' (extremo inicial incluido, final excluido), por lo que
-- un huésped PUEDE ingresar el mismo día en que otro se retira.
-- Funciona a nivel de motor: impide conflictos incluso si dos operaciones
-- intentan reservar la misma cabaña en simultáneo.
alter table public.reservas
  drop constraint if exists reservas_sin_superposicion;

alter table public.reservas
  add constraint reservas_sin_superposicion
  exclude using gist (
    cabana_id with =,
    daterange(fecha_ingreso, fecha_salida) with &&
  )
  where (estado <> 'cancelada');

-- ----------------------------------------------------------------------------
-- 7. Control de capacidad y de cabaña activa (garantía en PostgreSQL)
-- ----------------------------------------------------------------------------
create or replace function public.validar_reserva()
returns trigger
language plpgsql
security definer
set search_path = public
as $$
declare
  v_capacidad integer;
  v_activa    boolean;
begin
  select c.capacidad, c.activa
    into v_capacidad, v_activa
  from public.cabanas c
  where c.id = new.cabana_id;

  if not found then
    raise exception 'La cabaña seleccionada no existe.'
      using errcode = '23514';
  end if;

  if v_activa is not true then
    raise exception 'La cabaña seleccionada está inactiva y no admite reservas.'
      using errcode = '23514';
  end if;

  if v_capacidad is null then
    raise exception 'La cabaña seleccionada no tiene configurada su capacidad máxima.'
      using errcode = '23514';
  end if;

  if new.cantidad_huespedes > v_capacidad then
    raise exception 'La cantidad de huéspedes (%) supera la capacidad máxima de la cabaña (%).',
      new.cantidad_huespedes, v_capacidad
      using errcode = '23514';
  end if;

  return new;
end;
$$;

drop trigger if exists reservas_validar_datos on public.reservas;
create trigger reservas_validar_datos
  before insert or update on public.reservas
  for each row
  execute function public.validar_reserva();

-- ----------------------------------------------------------------------------
-- 8. Actualización automática de updated_at
-- ----------------------------------------------------------------------------
create or replace function public.actualizar_updated_at()
returns trigger
language plpgsql
as $$
begin
  new.updated_at = now();
  return new;
end;
$$;

drop trigger if exists reservas_actualizar_updated_at on public.reservas;
create trigger reservas_actualizar_updated_at
  before update on public.reservas
  for each row
  execute function public.actualizar_updated_at();

-- ----------------------------------------------------------------------------
-- 9. Carga inicial de las cuatro cabañas
-- ----------------------------------------------------------------------------
-- Se crean sin capacidad (NULL) para que el administrador la configure.
insert into public.cabanas (nombre, capacidad, descripcion, activa)
values
  ('Cabaña 1', null, null, true),
  ('Cabaña 2', null, null, true),
  ('Cabaña 3', null, null, true),
  ('Cabaña 4', null, null, true)
on conflict (nombre) do nothing;
