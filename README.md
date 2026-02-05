# Social Media Website

This repo contains a full-stack social media starter with a Vite + React client and an Express + MongoDB server.

## Structure

- `client/`: Front-end built with Vite, React, and Tailwind CSS.
- `server/`: Back-end API built with Express, MongoDB, and JWT authentication.

## Getting started

### Client

```bash
cd client
npm install
npm run dev
```

### Server

```bash
cd server
npm install
npm run dev
```

Create a `.env` file in `server/` if you want to override environment variables.

## Quick start from repo root

If you are in the repository root, run:

```bash
npm run dev
```

(Or `npm start`, which aliases to the same command.)

This starts the Vite client (`client/`) from the root folder.

To run the backend from root, use:

```bash
npm run server
```

For a production-like server start from root, use:

```bash
npm run server:start
```

## Notes

- The client uses a mock auth context and demo data for quick UI previews.
- The server exposes `/api/auth`, `/api/posts`, and `/api/users` endpoints.

## Troubleshooting

If you see an error like `ENOENT: no such file or directory, open ...\package.json`, npm is being run in a folder that does not have a `package.json`. Make sure you either:

- Run commands from the project root (this folder), or
- Run `cd client` / `cd server` first, then run npm commands there.


## Deploying frontend and backend separately

You can host the frontend on **Netlify** and the backend on **Render**.

- Netlify (frontend):
  - Base directory: `client`
  - Build command: `npm run build`
  - Publish directory: `dist`
  - Environment variable: `VITE_API_URL=https://<your-render-service>.onrender.com/api`

- Render (backend):
  - This repo includes `render.yaml` so Render can deploy the API from `server/`.
  - Set backend environment variables in Render (for example: `MONGO_URI`, `JWT_SECRET`, and optional `CORS_ORIGIN`).

After both are deployed, ensure the frontend points to the Render URL via `VITE_API_URL`.
