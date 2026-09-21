export default function LoadingSpinner({ label = "Loading..." }: { label?: string }) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 py-24 text-gray-500" role="status">
      <span className="spinner text-indigo-600" style={{ width: 28, height: 28, borderWidth: 3 }} />
      <span className="text-sm">{label}</span>
    </div>
  );
}
