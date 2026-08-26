// parcelsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createParcel, fetchMyParcels, fetchParcelById, updateDestination as updateDestinationRequest, fetchStatusHistory as fetchStatusHistoryRequest, cancelParcel as cancelParcelRequest } from "./parcelsAPI";

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

export const loadParcel = createAsyncThunk(
  "parcels/loadParcel",
  async (id, { rejectWithValue }) => {
    try {
      return await fetchParcelById(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not load parcel details."
      );
    }
  }
);

export const cancelOrder = createAsyncThunk(
  "parcels/cancelOrder",
  async (id, { rejectWithValue }) => {
    try {
      return await cancelParcelRequest(id);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not cancel this order."
      );
    }
  }
);

export const changeDestination = createAsyncThunk(
  "parcels/changeDestination",
  async ({ id, destination }, { rejectWithValue }) => {
    try {
      return await updateDestinationRequest(id, destination);
    } catch (err) {
      return rejectWithValue(
        err.response?.data?.message || "Could not update destination."
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
  detailStatus: "idle",
  detailError: null,
  cancellingId: null,
  updateDestStatus: "idle",
  updateDestError: null,
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
      })
      .addCase(loadParcel.pending, (state) => {
        state.detailStatus = "loading";
        state.detailError = null;
      })
      .addCase(loadParcel.fulfilled, (state, action) => {
        state.detailStatus = "succeeded";
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
        else state.items.push(action.payload);
      })
      .addCase(loadParcel.rejected, (state, action) => {
        state.detailStatus = "failed";
        state.detailError = action.payload;
      })
      .addCase(cancelOrder.pending, (state, action) => {
        state.cancellingId = action.meta.arg;
      })
      .addCase(cancelOrder.fulfilled, (state, action) => {
        state.cancellingId = null;
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(cancelOrder.rejected, (state) => {
        state.cancellingId = null;
      })
      .addCase(changeDestination.pending, (state) => {
        state.updateDestStatus = "loading";
        state.updateDestError = null;
      })
      .addCase(changeDestination.fulfilled, (state, action) => {
        state.updateDestStatus = "succeeded";
        const idx = state.items.findIndex((p) => p.id === action.payload.id);
        if (idx >= 0) state.items[idx] = action.payload;
      })
      .addCase(changeDestination.rejected, (state, action) => {
        state.updateDestStatus = "failed";
        state.updateDestError = action.payload;
      });
  },
});

export const { resetCreateStatus } = parcelsSlice.actions;

export const selectParcelById = (state, parcelId) =>
  state.parcels.items.find((p) => p.id === parcelId) ?? null;

export const selectAllParcels = (state) => state.parcels.items;

export default parcelsSlice.reducer;
