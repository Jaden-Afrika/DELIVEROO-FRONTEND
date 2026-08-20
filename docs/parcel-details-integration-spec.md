# Integration Spec — Parcel Details & Changes

> Status: **ARCHITECTURE DECIDED** — Afrika's slice (`features/parcels/parcelsSlice.js`)
> is the single source of truth (team decision, Day 4). "Parcel Details & Changes"
> (reducers, selectors, components, tests) lives in that slice.
> Written from branch `parcel-details-and-changes`.

---

## 1. Plain-language note on the current architecture

This feature is built on **Redux Toolkit + react-router**. State (parcels, and
originally auth) is managed through Redux slices, and navigation uses
`react-router` (`<BrowserRouter>`, `<Routes>`, `<Route>`, `useParams`, `Link`).
Post-team-decision state: `src/app/store.js` registers the root-level
`features/parcels/parcelsSlice.js` (Afrika's — create/load thunks + the
guarded cancel/changeDestination reducers from this feature). The components
themselves are plain functional components reading from that slice. Auth is
still the `useAuth` mock; `DELIVEROO-FRONTEND/` localStorage auth is
superseded.

---

## 2. `currentUser` shape expected by components

All of ParcelDetailsPage / CancelDeliveryButton / ChangeDestinationForm only ever
read **`currentUser.id`** (compared against `parcel.ownerId`). Currently sourced
from `src/hooks/useAuth.js`:

```js
// src/hooks/useAuth.js (temporary mock)
export default function useAuth() {
  return {
    currentUser: { id: 'user-1', name: 'Nesh' },
  }
}
```

**Contract:**
```js
{
  id: string,   // REQUIRED — must match parcel.ownerId values
  name: string, // optional, not currently consumed
}
```

Any real auth integration only needs to provide an object with `currentUser.id`.
A compatible swap keeps the same hook return shape `{ currentUser }`; if a future
auth source exposes a different shape, it must be adapted at `useAuth`, not in the
components.

Note: the initial mock user is `user-1`. Only parcels whose `ownerId === user-1`
show the cancel / change-destination controls (see §5).

---

## 3. Parcel object shape (`features/parcels/parcelsSlice.js`)

Single source of truth is the root-level team slice (Afrika's). Items arrive via
the `loadMyParcels` / `submitParcel` thunks (backend through
`features/parcels/parcelsAPI.js`); the feature adds no seed data — initial
`items: []`. The feature's components read this shape:

```js
{
  id: string,             // stable primary key, e.g. 'p-1001'
  pickupLocation: string, // display label, e.g. 'Westlands, Nairobi'
  destination: string,    // display label, e.g. 'Kilimani, Nairobi'
  weightCategory: string, // 'light' | 'medium' | 'heavy' — label via WEIGHT_CATEGORIES
  price: number,          // quote in Ksh, rendered as `Ksh {price}`
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled',
  currentLocation: string,
  createdAt: string,      // ISO 8601
  ownerId: string,        // user id (owner)
}
```

`cancelled` is never assigned by the API — it is the result of the client-side
`cancelParcel` action (see §4). Status values are lowercase/snake so they are safe
as CSS suffixes; the badge maps them to display labels.

---

## 4. Actions & guard logic

| Action | Effect | Guard |
|---|---|---|
| `cancelParcel(parcelId)` | sets `parcel.status = 'cancelled'` | **no-op** if parcel is missing **or** `status === 'delivered'` |
| `changeDestination(parcelId, newDestination)` | sets `parcel.destination` | **no-op** if parcel is missing **or** `status === 'delivered'` |

The guards live in the **slice reducers** (not just the UI), so the rule holds no
matter what triggers the action. Delivered parcels are therefore immutable on
cancel/change. Actions are defined in `features/parcels/parcelsSlice.js` (sync
`reducers:` entries, in Afrika's slice style), selectors `selectParcelById` /
`selectAllParcels` read `state.parcels.items`. Tests:
`features/parcels/parcelsSlice.test.js` (includes delivered-block cases).

---

## 5. Route contract

Route: **`/orders/:id`** → renders `ParcelDetailsPage`.

- `ParcelDetailsPage` reads `:id` via `useParams()` and looks up the parcel with
  `selectParcelById(state, id)`.
- Missing/invalid id → renders "Parcel not found."
- Orders list (`/orders`) links to `/orders/${parcel.id}` and renders the same
  component.
- Ownership: `CancelDeliveryButton` and `ChangeDestinationForm` render **null**
  (hidden entirely) when `parcel.ownerId !== currentUser.id`. Only the creator
  ever sees the controls.
- If `status === 'delivered'`, both controls are rendered disabled. The slice guard
  is the backstop. (Edge note: because the buttons are `disabled`, the
  "already delivered" message in the click handlers is currently unreachable —
  the disabled state is what communicates it.)

---

## 6. Proposed map component contract (to confirm with Kesh)

Current placeholder (`src/pages/ParcelDetailsPage.jsx`) is a bordered slot between
the page header and the info grid. Suggested contract for the real map component:

```js
<RouteMap
  pickup={parcel.pickupLocation}       // string display label
  destination={parcel.destination}     // string display label
  currentLocation={parcel.currentLocation}
/>
```

Open questions to confirm with Kesh (don't guess):
1. Does the map accept **address strings** (as above) or **lat/lng coordinates**?
   (Mock data currently holds only strings — if lat/lng is required, coordinates
   must be added to the parcel shape in §3.)
2. Should `currentLocation` be a marker, or only used for the live position
   overlay/route updates?
3. Should distance/duration be computed in the component (`DirectionsService`)
   or passed in by a parent?

Whatever is decided, keep the same `id`-keyed parcel shape so the map stays
decoupled from how parcels are stored.

---

## 7. What NOT to touch during integration

- `pages/CreateDelivery.jsx`, `pages/MyParcels.jsx` — Afrika's pages. They were
  read (not edited) to verify they dispatch into the registered slice and read
  `s.parcels.items`.
- `kesh/` map component (does not exist on any branch yet — `CreateDelivery`
  imports `../../kesh/components/RouteMap`, so the full main build waits on it).
- The cancel/change-destination **logic** (guards) in `features/parcels/parcelsSlice.js`
  — built and tested there.
- Teammate branches/files (`DELIVEROO-FRONTEND/`, auth work).

## Known edge cases / notes

- `features/parcels/parcelsAPI.js` imported `../../api/client` (resolves outside
  `src/`); corrected to `../../src/api/client`. This latent bug existed on `main`
  and would have broken `CreateDelivery`/`MyParcels` imports once the map landed.
- `tailwind.config.js` `content` globs only `./src/**` — root-level `features/**`
  and `pages/**` Tailwind classes are not generated yet. Afrika/Kesh to extend the
  globs when their pages merge; out of scope here.

---

## Checklist for whoever integrates

- [ ] Architecture decision recorded (see §1).
- [ ] Auth source provides `currentUser.id` (§2) — otherwise keep `useAuth` mock.
- [ ] Parcel source exposes the §3 shape (or mapping added in one place).
- [ ] `/orders/:id` routing exists in the final app (§5).
- [ ] Map prop contract agreed with Kesh (§6).
- [ ] Status badge / modal styling still uses the team design tokens
      (`amber/route/depot/caution`, `ink/fog/paper`, `font-mono` for labels).