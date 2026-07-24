import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { Home, Calendar, FileText, MessageSquare, Users, Settings, LogOut, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

type SidebarProps = {
  userRole: 'patient' | 'doctor';
};

const Sidebar: React.FC<SidebarProps> = ({ userRole }) => {
  const location = useLocation();
  
  const isActive = (path: string) => {
    return location.pathname === path;
  };
  
  const patientLinks = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/patient/dashboard' },
    { name: 'Appointments', icon: <Calendar className="h-5 w-5" />, path: '/patient/appointments' },
    { name: 'Reports', icon: <FileText className="h-5 w-5" />, path: '/patient/reports' },
    { name: 'Messages', icon: <MessageSquare className="h-5 w-5" />, path: '/patient/messages' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/patient/settings' }
  ];
  
  const doctorLinks = [
    { name: 'Dashboard', icon: <Home className="h-5 w-5" />, path: '/doctor/dashboard' },
    { name: 'Schedule', icon: <Calendar className="h-5 w-5" />, path: '/doctor/schedule' },
    { name: 'Patients', icon: <Users className="h-5 w-5" />, path: '/doctor/patients' },
    { name: 'Reports', icon: <FileText className="h-5 w-5" />, path: '/doctor/reports' },
    { name: 'Messages', icon: <MessageSquare className="h-5 w-5" />, path: '/doctor/messages' },
    { name: 'Settings', icon: <Settings className="h-5 w-5" />, path: '/doctor/settings' }
  ];
  
  const links = userRole === 'patient' ? patientLinks : doctorLinks;
  
  return (
    <aside className="hidden md:flex flex-col bg-white border-r border-slate-200 w-64 min-h-[calc(100vh-4rem)] sticky top-16 z-20">
      <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
        <div className="mb-6 px-2 text-xs font-semibold text-slate-400 uppercase tracking-wider">
          Menu
        </div>
        {links.map((link) => (
          <Link
            key={link.path}
            to={link.path}
            className={`flex items-center justify-between group px-3 py-2.5 rounded-xl transition-all duration-200 ${
              isActive(link.path)
                ? 'bg-slate-900 text-white shadow-md'
                : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
            }`}
          >
            <div className="flex items-center gap-3">
              {React.cloneElement(link.icon, {
                className: `${isActive(link.path) ? 'text-healthy-400' : 'text-slate-400 group-hover:text-slate-600'} h-5 w-5 transition-colors`
              })}
              <span className="font-medium text-sm">{link.name}</span>
            </div>
            {isActive(link.path) && (
              <ChevronRight className="h-4 w-4 text-white/50" />
            )}
          </Link>
        ))}
      </div>
      
      <div className="p-4 border-t border-slate-200">
        <Button variant="ghost" className="w-full justify-start text-slate-500 hover:text-red-600 hover:bg-red-50 rounded-xl" asChild>
          <Link to="/login">
            <LogOut className="h-5 w-5 mr-3" />
            <span className="font-medium text-sm">Sign Out</span>
          </Link>
        </Button>
      </div>
    </aside>
  );
};

export default Sidebar;
