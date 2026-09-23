# Casandra

Mercado de predicción para preguntas de examen. Frontend en TanStack Start, Vite y React. Datos en Supabase (`supabase/config.toml`, proyecto `pwzqriypryqxzuczhrpp`).

## Cursor Cloud specific instructions

- Node.js 20 o superior. La instalación de dependencias es `npm ci` (definida en `.cursor/environment.json`).
- El servidor de desarrollo arranca con `npm run dev -- --host 0.0.0.0 --port 5173`. La app queda en el puerto 5173.
- Comprobar cambios con `npm run lint`. El build de producción es `npm run build`.
- No edites `src/routeTree.gen.ts` a mano. Las rutas viven en `src/routes/`.
- No hace falta configurar Supabase. Este entorno no tiene claves del proyecto y no hay que pedirlas ni crearlas.
