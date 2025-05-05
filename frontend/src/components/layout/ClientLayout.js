'use client';

import { usePathname } from 'next/navigation';
import Sidebar from './Sidebar';
import Header from './Header';

export default function ClientLayout({ children }) {
  const pathname = usePathname();
  
  // Pages that should not have the sidebar (login, register, etc.)
  const fullWidthPages = ['/login', '/register', '/start'];
  const isFullWidthPage = fullWidthPages.includes(pathname);

  if (isFullWidthPage) {
    return <div id="app-root">{children}</div>;
  }

  return (
    <div className="flex h-screen bg-gray-100">
      <Sidebar />
      <div className="flex-1 flex flex-col overflow-hidden">
        <Header />
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-100 p-6">
          {children}
        </main>
      </div>
    </div>
  );
}
