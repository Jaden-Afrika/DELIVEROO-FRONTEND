// parcelsSlice.js
import { createSlice, createAsyncThunk } from "@reduxjs/toolkit";
import { createParcel, fetchMyParcels } from "./parcelsAPI";

/**
 * Shape of a parcel object coming from the backend (align with team):
 * {
 *   id, pickupLocation, destination, weightCategory, price,
 *   status: "pending" | "in_transit" | "delivered",
 *   currentLocation, createdAt, ownerId
 * }
 */

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

export const { resetCreateStatus } = parcelsSlice.actions;
export default parcelsSlice.reducer;
