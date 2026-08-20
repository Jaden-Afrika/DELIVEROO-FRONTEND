# Integration Spec — Parcel Details & Changes

> Status: **PENDING TEAM ARCHITECTURE DECISION**
> This document captures everything needed to integrate the "Parcel Details & Changes"
> feature into whichever architecture the team lands on, so the work doesn't have to be
> re-derived later. Written from branch `parcel-details-and-changes`, Day 3 (verification pass).

---

## 1. Plain-language note on the current architecture

This feature is built on **Redux Toolkit + react-router**. State (parcels, and
originally auth) is managed through Redux slices, and navigation uses
`react-router` (`<BrowserRouter>`, `<Routes>`, `<Route>`, `useParams`, `Link`).
If the team's chosen architecture doesn't use these (e.g. the `DELIVEROO-FRONTEND`
app on `main` uses hand-rolled history-based navigation and localStorage auth,
with no Redux), **porting this logic will require rewriting state management and
routing, not just markup.** The components themselves are plain functional
components and can be reused largely as-is; the *data access layer* and
*navigation hooks* are where the port lives.

---

## 2. `currentUser` shape expected by components

All of ParcelDetailsPage / CancelDeliveryButton / ChangeDestinationForm only ever
read **`currentUser.id`** (compared against `parcel.createdBy`). Currently sourced
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
  id: string,   // REQUIRED — must match parcel.createdBy values
  name: string, // optional, not currently consumed
}
```

Any real auth integration only needs to provide an object with `currentUser.id`.
A compatible swap keeps the same hook return shape `{ currentUser }`; if a future
auth source exposes a different shape, it must be adapted at `useAuth`, not in the
components.

Note: the initial mock user is `user-1`. Only parcels whose `createdBy === user-1`
show the cancel / change-destination controls (see §5).

---

## 3. Parcel object shape (`src/features/parcels/parcelsSlice.js`)

Loaded from `src/mocks/parcels.js`, keyed by id in `state.parcels.byId`.

```js
{
  id: string,             // stable primary key, e.g. 'p-1001'
  pickupLocation: string, // display label, e.g. 'Westlands, Nairobi'
  destination: string,    // display label, e.g. 'Kilimani, Nairobi'
  weight: string,         // weight-category display string, e.g. 'Medium (5-10kg)'
  price: number,          // quote in Ksh, rendered as `Ksh {price}`
  status: 'pending' | 'in_transit' | 'delivered' | 'cancelled',
  currentLocation: string,
  dateCreated: string,    // ISO 8601
  createdBy: string,      // user id (owner)
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
cancel/change.

---

## 5. Route contract

Route: **`/orders/:id`** → renders `ParcelDetailsPage`.

- `ParcelDetailsPage` reads `:id` via `useParams()` and looks up the parcel with
  `selectParcelById(state, id)`.
- Missing/invalid id → renders "Parcel not found."
- Orders list (`/orders`) links to `/orders/${parcel.id}` and renders the same
  component.
- Ownership: `CancelDeliveryButton` and `ChangeDestinationForm` render **null**
  (hidden entirely) when `parcel.createdBy !== currentUser.id`. Only the creator
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

- `src/mocks/`, `src/api/`, `src/features/parcels/parcelsSlice.js` — shared data
  layer, shaped to match the future Flask API (see comments at the top of
  `src/mocks/parcels.js`).
- The cancel/change-destination **logic** (guards) in the slice — already built and
  tested (`src/features/parcels/parcelsSlice.test.js`).
- Teammate branches/files (`DELIVEROO-FRONTEND/`, auth work, afrika-parcels).

---

## Checklist for whoever integrates

- [ ] Architecture decision recorded (see §1).
- [ ] Auth source provides `currentUser.id` (§2) — otherwise keep `useAuth` mock.
- [ ] Parcel source exposes the §3 shape (or mapping added in one place).
- [ ] `/orders/:id` routing exists in the final app (§5).
- [ ] Map prop contract agreed with Kesh (§6).
- [ ] Status badge / modal styling still uses the team design tokens
      (`amber/route/depot/caution`, `ink/fog/paper`, `font-mono` for labels).