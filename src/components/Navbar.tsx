import React from 'react';
import { Link } from 'react-router-dom';
import { Bell, Activity, Search, ChevronDown } from 'lucide-react';
import { Input } from '@/components/ui/input';

type NavbarProps = {
  userRole: 'patient' | 'doctor';
};

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  return (
    <header className="bg-white border-b border-slate-200 sticky top-0 z-30 h-16 w-full shadow-sm">
      <div className="flex items-center justify-between h-full px-4 sm:px-6 lg:px-8 max-w-[1600px] mx-auto">
        
        {/* Left: Brand */}
        <div className="flex items-center gap-12">
          <Link to="/" className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-healthy-500 to-blue-600 flex items-center justify-center shadow-sm">
              <Activity className="h-5 w-5 text-white" />
            </div>
            <span className="text-xl font-bold text-slate-900 hidden sm:block">
              QuantumOS
            </span>
          </Link>

          {/* Search (Hidden on small screens) */}
          <div className="hidden md:flex relative w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <Input 
              placeholder="Search patients, appointments, or reports..." 
              className="pl-9 bg-slate-50 border-slate-200 h-9 rounded-full text-sm focus-visible:ring-healthy-500 w-full"
            />
          </div>
        </div>
        
        {/* Right: Actions & Profile */}
        <div className="flex items-center gap-4">
          <button className="relative p-2 rounded-full text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors">
            <Bell className="h-5 w-5" />
            <span className="absolute top-1.5 right-1.5 h-2 w-2 rounded-full bg-red-500 border-2 border-white"></span>
          </button>
          
          <div className="h-6 w-px bg-slate-200 mx-1 hidden sm:block"></div>
          
          <Link to={userRole === 'patient' ? "/patient/profile" : "/doctor/profile"} className="flex items-center gap-3 hover:bg-slate-50 p-1.5 rounded-full pr-3 transition-colors">
            <img 
              src={`https://i.pravatar.cc/100?img=${userRole === 'doctor' ? '12' : '5'}`} 
              alt="Profile" 
              className="h-8 w-8 rounded-full border border-slate-200 object-cover"
            />
            <div className="hidden md:flex flex-col items-start">
              <span className="text-sm font-semibold text-slate-700 leading-none mb-1">
                {userRole === 'patient' ? 'Jane Doe' : 'Dr. Smith'}
              </span>
              <span className="text-xs text-slate-500 leading-none">
                {userRole === 'patient' ? 'Patient' : 'Cardiologist'}
              </span>
            </div>
            <ChevronDown className="h-4 w-4 text-slate-400 hidden md:block" />
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
