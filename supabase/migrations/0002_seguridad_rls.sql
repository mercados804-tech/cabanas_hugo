-- ============================================================================
-- SISTEMA DE GESTIÓN DE RESERVAS - CABAÑAS PUERTO IGUAZÚ (EJÉRCITO ARGENTINO)
-- Migración 0002: seguridad (Row Level Security)
-- ----------------------------------------------------------------------------
-- Ejecutar DESPUÉS de la migración 0001.
-- Regla general: solo el administrador autenticado y registrado en
-- public.usuarios_administradores puede acceder a los datos.
-- El rol "anon" (visitante sin sesión) no accede a ninguna tabla.
-- ============================================================================

-- ----------------------------------------------------------------------------
-- 1. Función de autorización
-- ----------------------------------------------------------------------------
-- Comprueba que la sesión actual corresponda a un administrador autorizado.
-- Es SECURITY DEFINER para poder leer usuarios_administradores sin recursionar
-- en sus propias políticas RLS.
create or replace function public.es_administrador_autorizado()
returns boolean
language sql
stable
security definer
set search_path = public
as $$
  select exists (
    select 1
    from public.usuarios_administradores ua
    where ua.id = auth.uid()
  );
$$;

comment on function public.es_administrador_autorizado() is
  'Devuelve true si el usuario autenticado está registrado como administrador.';

revoke all on function public.es_administrador_autorizado() from public, anon;
grant execute on function public.es_administrador_autorizado() to authenticated;

-- ----------------------------------------------------------------------------
-- 2. Activación de RLS
-- ----------------------------------------------------------------------------
alter table public.cabanas                enable row level security;
alter table public.reservas               enable row level security;
alter table public.usuarios_administradores enable row level security;

-- ----------------------------------------------------------------------------
-- 3. Políticas sobre "cabanas"
-- ----------------------------------------------------------------------------
drop policy if exists cabanas_admin_consultar on public.cabanas;
create policy cabanas_admin_consultar on public.cabanas
  for select to authenticated
  using (public.es_administrador_autorizado());

drop policy if exists cabanas_admin_crear on public.cabanas;
create policy cabanas_admin_crear on public.cabanas
  for insert to authenticated
  with check (public.es_administrador_autorizado());

drop policy if exists cabanas_admin_modificar on public.cabanas;
create policy cabanas_admin_modificar on public.cabanas
  for update to authenticated
  using (public.es_administrador_autorizado())
  with check (public.es_administrador_autorizado());

-- Sin política de DELETE: no se permite eliminar cabañas desde la aplicación.

-- ----------------------------------------------------------------------------
-- 4. Políticas sobre "reservas"
-- ----------------------------------------------------------------------------
drop policy if exists reservas_admin_consultar on public.reservas;
create policy reservas_admin_consultar on public.reservas
  for select to authenticated
  using (public.es_administrador_autorizado());

drop policy if exists reservas_admin_crear on public.reservas;
create policy reservas_admin_crear on public.reservas
  for insert to authenticated
  with check (public.es_administrador_autorizado());

drop policy if exists reservas_admin_modificar on public.reservas;
create policy reservas_admin_modificar on public.reservas
  for update to authenticated
  using (public.es_administrador_autorizado())
  with check (public.es_administrador_autorizado());

-- Sin política de DELETE: las reservas (incluidas las canceladas) se conservan
-- siempre para mantener el historial.

-- ----------------------------------------------------------------------------
-- 5. Políticas sobre "usuarios_administradores"
-- ----------------------------------------------------------------------------
-- El administrador solo puede leer su propia ficha. La creación de la ficha se
-- realiza una única vez desde el SQL Editor (ver instrucciones de la Etapa 2).
drop policy if exists usuarios_administradores_ver_propio on public.usuarios_administradores;
create policy usuarios_administradores_ver_propio on public.usuarios_administradores
  for select to authenticated
  using (id = auth.uid());

-- ----------------------------------------------------------------------------
-- 6. Permisos (GRANT / REVOKE)
-- ----------------------------------------------------------------------------
grant usage on schema public to authenticated;

grant select, insert, update on public.cabanas  to authenticated;
grant select, insert, update on public.reservas to authenticated;
grant select on public.usuarios_administradores to authenticated;

-- El rol anónimo (sin sesión) no tiene ningún acceso a los datos.
revoke all on public.cabanas  from anon;
revoke all on public.reservas from anon;
revoke all on public.usuarios_administradores from anon;
