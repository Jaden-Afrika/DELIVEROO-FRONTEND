# Afrika's part — Sending a Parcel

## Files
- `features/parcels/parcelsAPI.js` — API calls + weight/distance price rules
- `features/parcels/parcelsSlice.js` — Redux Toolkit slice (create parcel, fetch list)
- `pages/CreateDelivery.jsx` — the create-delivery form, with the live map
- `pages/MyParcels.jsx` — the dashboard list of a user's parcels

## Not standalone
This folder depends on shared project scaffolding that isn't included here:
- `api/client.js` — the shared axios instance
- `app/store.js` — the Redux store this slice plugs into
- Kesh's `RouteMap` component (`../../kesh/components/RouteMap`) — used on the Create Delivery page for the live map, distance, and price

Merge alongside Kesh's branch (or the full project repo) to run it.

## Parcel shape assumed
```
{
  id, pickupLocation, destination, weightCategory, price,
  status: "pending" | "in_transit" | "delivered",
  currentLocation, createdAt, ownerId
}
```
