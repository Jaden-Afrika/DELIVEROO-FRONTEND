import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { submitParcel } from "../src/features/parcels/parcelsSlice";
import { WEIGHT_CATEGORIES, estimatePrice } from "../features/parcels/parcelsAPI";
import RouteMap from "../src/components/RouteMap";

export default function CreateDelivery() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { createStatus, createError } = useSelector((s) => s.parcels);

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

  async function handleSubmit(e) {
    e.preventDefault();
    setTouched({ pickupLocation: true, destination: true, weightCategory: true });
    if (!isValid) return;
    const result = await dispatch(submitParcel({
      pickupLocation: form.pickupLocation,
      destination: form.destination,
      weightCategory: form.weightCategory,
      distanceKm,
    }));
    if (submitParcel.fulfilled.match(result)) navigate("/parcels");
  }

  return (
    <div className="max-w-xl mx-auto px-4 py-10">
      <div className="mb-8">
        <p className="mb-1 font-mono text-xs font-medium uppercase tracking-widest text-amber">
          New delivery
        </p>
        <h1 className="font-display text-2xl font-bold text-ink">Send a parcel</h1>
        <p className="text-sm text-fog mt-1">
          Tell us where it's coming from, where it's going, and how heavy it is.
        </p>
      </div>

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        <div>
          <label htmlFor="pickupLocation" className="mb-1 block text-sm font-medium text-ink">
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
            className="w-full rounded-lg border border-slate-300 bg-paper px-3 py-2 text-sm text-ink placeholder:text-fog focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {touched.pickupLocation && errors.pickupLocation && (
            <p className="mt-1 text-xs text-caution">{errors.pickupLocation}</p>
          )}
        </div>

        <div>
          <label htmlFor="destination" className="mb-1 block text-sm font-medium text-ink">
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
            className="w-full rounded-lg border border-slate-300 bg-paper px-3 py-2 text-sm text-ink placeholder:text-fog focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          />
          {touched.destination && errors.destination && (
            <p className="mt-1 text-xs text-caution">{errors.destination}</p>
          )}
        </div>

        <RouteMap
          pickup={form.pickupLocation}
          destination={form.destination}
          onRouteCalculated={handleRouteCalculated}
        />

        <div>
          <label htmlFor="weightCategory" className="mb-1 block text-sm font-medium text-ink">
            Weight category
          </label>
          <select
            id="weightCategory"
            name="weightCategory"
            value={form.weightCategory}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-lg border border-slate-300 bg-paper px-3 py-2 text-sm text-ink focus:border-amber-500 focus:outline-none focus:ring-2 focus:ring-amber-500"
          >
            <option value="">Select weight...</option>
            {WEIGHT_CATEGORIES.map((w) => (
              <option key={w.value} value={w.value}>
                {w.label}
              </option>
            ))}
          </select>
          {touched.weightCategory && errors.weightCategory && (
            <p className="mt-1 text-xs text-caution">{errors.weightCategory}</p>
          )}
        </div>

        <div className="rounded-lg bg-paper border border-slate-200 px-4 py-3 space-y-1.5">
          <div className="flex items-center justify-between">
            <span className="text-sm text-fog">Estimated price</span>
            <span className="text-lg font-display font-semibold text-ink">
              {price !== null ? `KSh ${price.toLocaleString()}` : "\u2014"}
            </span>
          </div>
          {durationText && distanceKm > 0 && (
            <p className="text-xs font-mono text-fog">
              {distanceKm.toFixed(1)} km · {durationText} drive
            </p>
          )}
        </div>

        {createStatus === 'failed' && <p className="rounded-lg border border-caution/30 bg-caution/10 px-3 py-2 text-sm text-caution">{createError}</p>}
        <button
          type="submit"
          disabled={createStatus === 'loading'}
          className="w-full rounded-lg bg-ink py-2.5 text-sm font-semibold text-paper transition hover:ring-2 hover:ring-amber"
        >
          {createStatus === 'loading' ? 'Submitting...' : 'Submit delivery'}
        </button>
      </form>
    </div>
  );
}
