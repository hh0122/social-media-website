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

`npm run dev` starts the Vite client (`client/`) from the root folder.

`npm start` is configured for deployment and starts the backend API.

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
  - Environment variable: `VITE_API_URL=https://<your-render-service>.onrender.com/api` (recommended; if missing, this repo currently defaults production API calls to `https://social-media-website-udcf.onrender.com/api`).
  - For manual deploys, set `VITE_API_URL` in `client/.env` (you can copy `client/.env.example`) before running `npm run build`, then upload `client/dist` to Netlify.
  - SPA routing is enabled via `client/public/_redirects` so direct visits to routes like `/login` or `/profile` resolve to `index.html` instead of a Netlify 404.

- Render (backend):
  - Prefer **Blueprint deploy** so `render.yaml` is applied automatically.
  - If you create a Web Service manually, set:
    - Root directory: `server`
    - Build command: `npm install`
    - Start command: `npm start`
  - Set backend environment variables in Render (for example: `MONGO_URI`, `JWT_SECRET`, and optional `CORS_ORIGIN`).

After both are deployed, ensure the frontend points to the Render URL via `VITE_API_URL` (for this deployment, `https://social-media-website-udcf.onrender.com/api`).


If Render is using default commands (`yarn` + `yarn start`), this repo now works out of the box: install triggers backend dependency install via `postinstall`, and `start` launches the API server.


If you still see `vite: Permission denied` on Render, the service is still starting the frontend script. Re-check that the service start command is backend-focused (`npm start` in `server/`, or root `yarn start` on this latest commit) and redeploy.
