# Chulla Gol

Aplicación React + Vite con registro de formulario y guardado de resultados en Firebase Firestore.

## Firebase en Vercel

Define estas variables de entorno en Vercel y, para desarrollo local, en un archivo `.env.local`:

```bash
VITE_FIREBASE_API_KEY=
VITE_FIREBASE_AUTH_DOMAIN=
VITE_FIREBASE_PROJECT_ID=
VITE_FIREBASE_STORAGE_BUCKET=
VITE_FIREBASE_MESSAGING_SENDER_ID=
VITE_FIREBASE_APP_ID=
VITE_FIREBASE_MEASUREMENT_ID=
VITE_FIREBASE_COLLECTION_NAME=promocion_registros
```

La app guarda cada registro en Firestore con los datos del formulario, el resultado de la partida, el premio obtenido y la marca de tiempo del servidor.

## Seguridad básica

- La validación principal sigue en el cliente para bloquear datos vacíos o mal formados antes de enviar.
- No se exponen claves en el código; todo se toma desde variables de entorno.
- Revisa las reglas de Firestore para permitir solo escrituras necesarias para esta promoción.

## Desarrollo

- `npm install`
- `npm run dev`
- `npm run build`