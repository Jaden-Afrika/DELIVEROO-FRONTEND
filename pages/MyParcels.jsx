import { useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { Link } from "react-router-dom";
import { loadMyParcels } from "../features/parcels/parcelsSlice";

const STATUS_STYLES = {
  pending: "bg-amber-100 text-amber-700",
  in_transit: "bg-blue-100 text-blue-700",
  delivered: "bg-emerald-100 text-emerald-700",
};

const STATUS_LABELS = {
  pending: "Pending",
  in_transit: "In transit",
  delivered: "Delivered",
};

function StatusBadge({ status }) {
  const style = STATUS_STYLES[status] || "bg-slate-100 text-slate-600";
  const label = STATUS_LABELS[status] || status;
  return (
    <span className={`inline-block rounded-full px-2.5 py-1 text-xs font-medium ${style}`}>
      {label}
    </span>
  );
}

function formatDate(dateStr) {
  if (!dateStr) return "—";
  return new Date(dateStr).toLocaleDateString(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}

export default function MyParcels() {
  const dispatch = useDispatch();
  const { items, listStatus, listError } = useSelector((s) => s.parcels);

  useEffect(() => {
    dispatch(loadMyParcels());
  }, [dispatch]);

  return (
    <div className="max-w-3xl mx-auto px-4 py-10">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs font-semibold tracking-widest text-amber-600 uppercase mb-1">
            Dashboard
          </p>
          <h1 className="text-2xl font-bold text-slate-900">My parcels</h1>
        </div>
        <Link
          to="/parcels/new"
          className="rounded-lg bg-slate-900 text-white text-sm font-semibold px-4 py-2 hover:bg-slate-800 transition"
        >
          + New delivery
        </Link>
      </div>

      {listStatus === "loading" && (
        <div className="text-sm text-slate-500 py-10 text-center">Loading your parcels...</div>
      )}

      {listStatus === "failed" && (
        <p className="text-sm text-red-600 bg-red-50 border border-red-200 rounded-lg px-3 py-2">
          {listError}
        </p>
      )}

      {listStatus === "succeeded" && items.length === 0 && (
        <div className="text-center py-16 border border-dashed border-slate-300 rounded-xl">
          <p className="text-slate-500 text-sm mb-3">You haven't sent any parcels yet.</p>
          <Link
            to="/parcels/new"
            className="text-sm font-semibold text-amber-600 hover:text-amber-700"
          >
            Send your first parcel →
          </Link>
        </div>
      )}

      {listStatus === "succeeded" && items.length > 0 && (
        <div className="space-y-3">
          {items.map((parcel) => (
            <Link
              key={parcel.id}
              to={`/parcels/${parcel.id}`}
              className="flex items-center justify-between rounded-xl border border-slate-200 px-4 py-3.5 hover:border-slate-300 hover:shadow-sm transition"
            >
              <div>
                <p className="text-sm font-semibold text-slate-900">{parcel.destination}</p>
                <p className="text-xs text-slate-500 mt-0.5">
                  From {parcel.pickupLocation} · {formatDate(parcel.createdAt)}
                </p>
              </div>
              <div className="flex items-center gap-3">
                <StatusBadge status={parcel.status} />
                <span className="text-slate-400 text-sm">›</span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
