"use client";
 
import { SnackbarProvider } from 'notistack';
import SideNav from './_components/SideNav';
 
export default function AdminLayout({ children }) {
  return (
    <SnackbarProvider maxSnack={3} autoHideDuration={3000}>
      <div className="min-h-screen bg-slate-50">
        <SideNav />
        <main className={`ml-16 lg:ml-64 transition-all duration-300 min-h-screen`}>
          {children}
        </main>
      </div>
    </SnackbarProvider>
  );
}