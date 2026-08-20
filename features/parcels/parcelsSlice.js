// parcelsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createParcel, fetchMyParcels } from "./parcelsAPI";

/**
 * Shape of a parcel object coming from the backend (align with team):
 * {
 *   id, pickupLocation, destination, weightCategory, price,
 *   status: "pending" | "in_transit" | "delivered" | "cancelled",
 *   currentLocation, createdAt, ownerId
 * }
 */

// Status values — lowercase/snake so they double as safe CSS class suffixes
// (see StatusBadge component). Display labels are handled separately.
export const PARCEL_STATUS = {
  PENDING: "pending",
  IN_TRANSIT: "in_transit",
  DELIVERED: "delivered",
  CANCELLED: "cancelled",
};

export const submitParcel = createAsyncThunk(
  "parcels/submitParcel",
  async (payload, { rejectWithValue }) => {
    try {
      const parcel = await createParcel(payload);
      return parcel;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not create delivery. Please try again."
      );
    }
  }
);

export const loadMyParcels = createAsyncThunk(
  "parcels/loadMyParcels",
  async (_, { rejectWithValue }) => {
    try {
      const parcels = await fetchMyParcels();
      return parcels;
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not load your parcels."
      );
    }
  }
);

const initialState = {
  items: [],
  listStatus: "idle", // idle | loading | succeeded | failed
  listError: null,
  createStatus: "idle", // idle | loading | succeeded | failed
  createError: null,
  lastCreatedId: null,
};

const parcelsSlice = createSlice({
  name: "parcels",
  initialState,
  reducers: {
    resetCreateStatus(state) {
      state.createStatus = "idle";
      state.createError = null;
      state.lastCreatedId = null;
    },
    // Guarded mutations — only allowed before delivery. The guards live
    // here (not just in the UI) so the rule holds no matter what triggers
    // the action, matching the existing slices' style.
    cancelParcel: {
      reducer(state, action) {
        const parcel = state.items.find((p) => p.id === action.payload.parcelId);
        if (!parcel) return;
        if (parcel.status === PARCEL_STATUS.DELIVERED) return;
        parcel.status = PARCEL_STATUS.CANCELLED;
      },
      prepare(parcelId) {
        return { payload: { parcelId } };
      },
    },
    changeDestination: {
      reducer(state, action) {
        const { parcelId, newDestination } = action.payload;
        const parcel = state.items.find((p) => p.id === parcelId);
        if (!parcel) return;
        if (parcel.status === PARCEL_STATUS.DELIVERED) return;
        parcel.destination = newDestination;
      },
      prepare(parcelId, newDestination) {
        return { payload: { parcelId, newDestination } };
      },
    },
  },
  extraReducers: (builder) => {
    builder
      .addCase(submitParcel.pending, (state) => {
        state.createStatus = "loading";
        state.createError = null;
      })
      .addCase(submitParcel.fulfilled, (state, action) => {
        state.createStatus = "succeeded";
        state.items.unshift(action.payload);
        state.lastCreatedId = action.payload.id;
      })
      .addCase(submitParcel.rejected, (state, action) => {
        state.createStatus = "failed";
        state.createError = action.payload;
      })
      .addCase(loadMyParcels.pending, (state) => {
        state.listStatus = "loading";
        state.listError = null;
      })
      .addCase(loadMyParcels.fulfilled, (state, action) => {
        state.listStatus = "succeeded";
        state.items = action.payload;
      })
      .addCase(loadMyParcels.rejected, (state, action) => {
        state.listStatus = "failed";
        state.listError = action.payload;
      });
  },
});

export const { resetCreateStatus, cancelParcel, changeDestination } = parcelsSlice.actions;

export const selectParcelById = (state, parcelId) =>
  state.parcels.items.find((p) => p.id === parcelId) ?? null;

export const selectAllParcels = (state) => state.parcels.items;

export default parcelsSlice.reducer;
