# Casandra

Mercado de predicción para preguntas de examen. Frontend en TanStack Start, Vite y React. Datos en Supabase (`supabase/config.toml`, proyecto `pwzqriypryqxzuczhrpp`).

## Cursor Cloud specific instructions

- Node.js 20 o superior. La instalación de dependencias es `npm ci` (definida en `.cursor/environment.json`).
- El servidor de desarrollo arranca con `npm run dev -- --host 0.0.0.0 --port 5173`. La app queda en el puerto 5173.
- Comprobar cambios con `npm run lint`. El build de producción es `npm run build`.
- No edites `src/routeTree.gen.ts` a mano. Las rutas viven en `src/routes/`.
- La app no arranca contra Supabase si faltan estas variables. Defínelas como Secrets del entorno de Cloud Agents (https://cursor.com/dashboard/cloud-agents), no en el repositorio:
  - `SUPABASE_URL` y `VITE_SUPABASE_URL` (la URL del proyecto, por ejemplo `https://pwzqriypryqxzuczhrpp.supabase.co`)
  - `SUPABASE_PUBLISHABLE_KEY` y `VITE_SUPABASE_PUBLISHABLE_KEY`
  - `SUPABASE_SERVICE_ROLE_KEY` (solo servidor)
- Al arrancar, `.cursor/sync-env.sh` copia esos Secrets a `.env.local`. Ese archivo está en `.gitignore`.
