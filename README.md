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

## Notes

- The client uses a mock auth context and demo data for quick UI previews.
- The server exposes `/api/auth`, `/api/posts`, and `/api/users` endpoints.
