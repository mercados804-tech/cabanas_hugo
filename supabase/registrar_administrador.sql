-- ============================================================================
-- PLANTILLA - Registrar el administrador autorizado
-- ----------------------------------------------------------------------------
-- Este archivo NO se ejecuta automáticamente. Es una plantilla de uso único.
--
-- PASOS:
--   1. En Supabase entrar en Authentication > Users > "Add user" >
--      "Create new user".
--   2. Completar el correo y la contraseña del administrador y confirmar el
--      usuario (activar "Auto Confirm User" para que pueda ingresar de una vez).
--   3. Volver al SQL Editor, reemplazar CORREO_DEL_ADMINISTRADOR por ese
--      correo y ejecutar este script.
--   4. (Opcional) Copiar el mismo correo en la variable VITE_ADMIN_EMAIL del
--      archivo .env para poder ingresar escribiendo un usuario simple.
-- ============================================================================

insert into public.usuarios_administradores (id, correo, nombre)
select
  u.id,
  u.email,
  coalesce(u.raw_user_meta_data ->> 'nombre', 'Administrador')
from auth.users u
where u.email = 'CORREO_DEL_ADMINISTRADOR'
on conflict (id) do update
  set correo = excluded.correo,
      nombre = coalesce(public.usuarios_administradores.nombre, excluded.nombre);
