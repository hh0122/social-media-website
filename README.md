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

If you are in the repository root, you can now run:

```bash
npm run dev
```

(Or `npm start`, which aliases to the same command.)

This starts the Vite client (`client/`) from the root folder.

You can also run:

```bash
npm run server
```

to start the API server (`server/`).

## Notes

- The client uses a mock auth context and demo data for quick UI previews.
- The server exposes `/api/auth`, `/api/posts`, and `/api/users` endpoints.

## Troubleshooting

If you see an error like `ENOENT: no such file or directory, open ...\package.json`, npm is being run in a folder that does not have a `package.json`. Make sure you either:

- Run commands from the project root (this folder), or
- Run `cd client` / `cd server` first, then run npm commands there.

