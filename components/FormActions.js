export default function FormActions({ loading, onClose, submitLabel, onSubmit }) {
  return (
    <div className="flex justify-end gap-4">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 bg-gray-200 rounded-md hover:bg-gray-300 text-gray-800 transition-colors"
        disabled={loading}
      >
        Cancel
      </button>
      <button
        type="button"
        onClick={onSubmit}
        className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition-colors"
        disabled={loading}
      >
        {loading ? "Saving..." : submitLabel}
      </button>
    </div>
  );
}