import React from 'react';
import Navbar from './Navbar';
import Sidebar from './Sidebar';

type LayoutProps = {
  children: React.ReactNode;
  userRole: 'patient' | 'doctor';
};

const Layout: React.FC<LayoutProps> = ({ children, userRole }) => {
  return (
    <div className="min-h-screen bg-slate-50 font-sans text-slate-900 flex flex-col selection:bg-healthy-500/20 selection:text-healthy-700">
      <Navbar userRole={userRole} />
      <div className="flex flex-1 max-w-[1600px] mx-auto w-full">
        <Sidebar userRole={userRole} />
        <main className="flex-1 p-4 md:p-8 overflow-y-auto animate-fade-in relative">
          <div className="absolute top-0 right-0 w-[50%] h-[50%] rounded-full bg-blue-100/30 blur-[120px] pointer-events-none -z-10"></div>
          {children}
        </main>
      </div>
    </div>
  );
};

export default Layout;
