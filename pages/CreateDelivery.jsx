import { useState, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { submitParcel, resetCreateStatus } from "../features/parcels/parcelsSlice";
import { WEIGHT_CATEGORIES, estimatePrice } from "../features/parcels/parcelsAPI";
import RouteMap from "../../kesh/components/RouteMap";

export default function CreateDelivery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createStatus, createError, lastCreatedId } = useSelector((s) => s.parcels);

  const [form, setForm] = useState({
    pickupLocation: "",
    destination: "",
    weightCategory: "",
  });
  const [distanceKm, setDistanceKm] = useState(0);
  const [durationText, setDurationText] = useState(null);
  const [touched, setTouched] = useState({});

  const errors = {
    pickupLocation: !form.pickupLocation.trim() ? "Pickup location is required." : "",
    destination: !form.destination.trim() ? "Destination is required." : "",
    weightCategory: !form.weightCategory ? "Choose a weight category." : "",
  };
  const isValid = !errors.pickupLocation && !errors.destination && !errors.weightCategory;
  const price = form.weightCategory ? estimatePrice(form.weightCategory, distanceKm) : null;

  useEffect(() => {
    if (createStatus === "succeeded" && lastCreatedId) {
      navigate("/parcels");
      dispatch(resetCreateStatus());
    }
  }, [createStatus, lastCreatedId, navigate, dispatch]);

  function handleChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  function handleBlur(e) {
    setTouched((t) => ({ ...t, [e.target.name]: true }));
  }

  function handleRouteCalculated({ distanceKm: km, durationText: duration }) {
    setDistanceKm(km);
    setDurationText(duration);
  }

  function handleSubmit(e) {
    e.preventDefault();
    setTouched({ pickupLocation: true, destination: true, weightCategory: true });
    if (!isValid) return;
    dispatch(submitParcel({ ...form, distanceKm, estimatedPrice: price }));
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="font-mono text-xs font-medium tracking-widest text-amber-500 uppercase mb-1">
          New delivery
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">Send a parcel</h1>
        <p className="text-sm text-fog mt-1">
          Tell us where it's coming from, where it's going, and how heavy it is.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="pickupLocation" className="block text-sm font-medium text-slate-700 mb-1">
            Pickup location
          </label>
          <input
            id="pickupLocation"
            name="pickupLocation"
            type="text"
            value={form.pickupLocation}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Westlands, Nairobi"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          {touched.pickupLocation && errors.pickupLocation && (
            <p className="text-xs text-red-600 mt-1">{errors.pickupLocation}</p>
          )}
        </div>

        <div>
          <label htmlFor="destination" className="block text-sm font-medium text-slate-700 mb-1">
            Destination
          </label>
          <input
            id="destination"
            name="destination"
            type="text"
            value={form.destination}
            onChange={handleChange}
            onBlur={handleBlur}
            placeholder="e.g. Kilimani, Nairobi"
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
          {touched.destination && errors.destination && (
            <p className="text-xs text-red-600 mt-1">{errors.destination}</p>
          )}
        </div>

        <RouteMap
          pickup={form.pickupLocation}
          destination={form.destination}
          onRouteCalculated={handleRouteCalculated}
        />

        <div>
          <label htmlFor="weightCategory" className="block text-sm font-medium text-slate-700 mb-1">
            Weight category
          </label>
          <select
            id="weightCategory"
            name="weightCategory"
            value={form.weightCategory}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-lg border border-slate-300 px-3 py-2 text-sm bg-white focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          >
            <option value="">Select weight...</option>
            {WEIGHT_CATEGORIES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          {touched.weightCategory && errors.weightCategory && (
            <p className="text-xs text-red-600 mt-1">{errors.weightCategory}</p>
          )}
        </div>

        <div className="rounded-lg bg-paper border border-slate-200 px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-fog">Estimated price</span>
            <span className="text-lg font-display font-semibold text-ink">
              {price !== null ? `KSh ${price.toLocaleString()}` : "—"}
            </span>
          </div>
          {durationText && distanceKm > 0 && (
            <p className="text-xs font-mono text-fog">
              {distanceKm.toFixed(1)} km · {durationText} drive
            </p>
          )}
        </div>

        {createStatus === "failed" && createError && (
          <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
            {createError}
          </p>
        )}

        <button
          type="submit"
          disabled={createStatus === "loading"}
          className="w-full rounded-lg bg-slate-900 text-white text-sm font-semibold py-2.5 hover:bg-slate-800 disabled:opacity-60 disabled:cursor-not-allowed transition"
        >
          {createStatus === "loading" ? "Submitting..." : "Submit delivery"}
        </button>
      </form>
    </div>
  );
}
