export function FooterInfo({ year, company }) {
  if (!year) return null;
  
  return (
    <div className="text-xs text-gray-500 text-center" data-testid="footer-info">
      <p>{year}</p>
      <p>{company}</p>
    </div>
  );
}