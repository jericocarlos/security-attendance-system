import SideNav from "./_components/SideNav";


export default function AdminLayout({ children }) {
  return (
    <div className="flex h-screen">

      {/* Main Content */}
      <main className="flex-1 bg-gray-100 p-6">{children}</main>
    </div>
  );
}