import './globals.css';

export const metadata = {
  title: 'RFID Attendance System',
  description: 'Track employee attendance using RFID technology',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <body className="min-h-screen bg-gray-100">
        {children}
      </body>
    </html>
  );
}