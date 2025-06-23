export function FormError({ error }) {
  if (!error) return null;
  
  return (
    <div 
      className="bg-red-50 border border-red-400 text-red-700 px-4 py-3 rounded relative" 
      role="alert" 
      aria-live="assertive"
      data-testid="form-error"
    >
      <span className="block sm:inline">{error}</span>
    </div>
  );
}