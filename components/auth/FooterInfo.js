export function FooterInfo({ year, company }) {
  return (
    <div className="text-slate-400 text-sm">
      &copy; {year} {company}
    </div>
  );
}