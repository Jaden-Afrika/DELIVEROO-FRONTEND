# Deliveroo

A parcel courier delivery web app (send-parcel / dispatch-tracker, in the spirit of SendIT). Users create parcel deliveries, track their status, and request destination or cancellation changes; admins manage all parcels and update status and current location.

## Tech stack

- **React 19** + **Vite 8**
- **Redux Toolkit** for state management
- **React Router 7** for client-side routing
- **Leaflet / OpenStreetMap** for maps (react-leaflet), with free geocoding (Nominatim) and routing (OSRM) — no API key required
- **Tailwind CSS** for styling
- **Axios** for API requests
- **Jest** + React Testing Library for tests

> Note: `@react-google-maps/api` and `VITE_GOOGLE_MAPS_API_KEY` appear in dependencies and `.env` examples from an earlier Google Maps approach, but the current `RouteMap` component is built entirely on Leaflet/OpenStreetMap and does not use the Google Maps key.

## Setup

```bash
npm install
npm run dev        # Vite dev server (default http://localhost:5173)
npm run build      # production build
npm test           # Jest test suite
npm run lint       # oxlint
```

### Environment variables

Create a `.env` file in the project root. The only variable the app reads in code is the API base URL (the live backend defaults to **`http://localhost:5000`**):

```bash
VITE_API_URL=http://localhost:5000
```

Other keys present in the repo (e.g. `VITE_GOOGLE_MAPS_API_KEY`) are leftover from earlier approaches and are not currently read by the application.

### Backend dependency

This frontend talks to the Django + DRF backend at `DELIVEROO-BACKEND`. It expects endpoints for authentication (`/auth/login`, `/auth/signup`) and parcel operations. See **Related repos** below.

## Routes

| Route | Access | Page |
| --- | --- | --- |
| `/login`, `/signup` | public | Auth (Login / SignUp) |
| `/orders` | authenticated (default) | Orders overview |
| `/orders/:id` | authenticated | Parcel details |
| `/parcels` | user | My parcels |
| `/parcels/new` | user | Create a delivery |
| `/parcels/:id` | user | Parcel details |
| `/admin` | admin | Admin parcel management |

Authentication guards (`RequireAuth` / `RequireUser` / `RequireAdmin`) are enforced via the router.

## Features

- **Auth**: signup, login, logout against the live API; JWT stored in `localStorage` and attached to requests.
- **Parcels (user)**: create a delivery (pickup, destination, weight category) with live route + estimated price on the map; list my parcels; view details; change destination; cancel an order.
- **Admin**: list all parcels, update status and current location.
- **Map**: Leaflet map shows pickup/destination markers, the route polyline, and estimated distance/time. Geocoding via Nominatim and routing via OSRM (OpenStreetMap), key-free.

## Project structure

```
src/
  api/            # axios client + auth/parcels API calls
  app/store.js    # Redux Toolkit store
  components/     # shared UI (AppShell, RouteMap, StatusBadge, guards, ...)
  features/       # Redux slices + API per feature (auth, parcels, admin)
  hooks/          # shared hooks (useAuth)
  mocks/          # mock data (src/api/parcels.js is still in mock mode)
  pages/          # route-level pages
  test/           # Jest setup + integration tests
```

Note: the repository also contains root-level `pages/` and `features/parcels/` folders that predate the `src/` layout. `src/App.jsx` still imports `pages/CreateDelivery` and `pages/MyParcels` from the root, and `pages/CreateDelivery` uses `features/parcels/parcelsAPI.js` for weight-category pricing. These are deliberately kept in place for now; only the now-unused root `features/parcels/parcelsSlice.js` has been removed.

## Deployed URL

Not currently deployed. If/when this is deployed to Vercel, add the production URL here. (`vercel.json` is configured only for SPA rewrites to `index.html`.)

## Related repos

- **[DELIVEROO-BACKEND](https://github.com/Jaden-Afrika/DELIVEROO-BACKEND)** — the Django + Django REST Framework API this frontend depends on.
