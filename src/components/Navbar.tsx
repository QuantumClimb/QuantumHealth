
import React from 'react';
import { Link } from 'react-router-dom';
import { User, Bell } from 'lucide-react';

type NavbarProps = {
  userRole: 'patient' | 'doctor';
};

const Navbar: React.FC<NavbarProps> = ({ userRole }) => {
  return (
    <header className="glass-card shadow-sm sticky top-0 z-30 px-4 py-3 mx-4 mt-4 mb-2">
      <div className="flex items-center justify-between">
        <Link to="/" className="flex items-center">
          <span className="text-2xl font-bold bg-gradient-to-r from-healthy-400 to-nature-500 text-transparent bg-clip-text">
            QUANTUM HEALTH
          </span>
        </Link>
        
        <div className="flex items-center gap-4">
          <button className="p-2 rounded-full hover:bg-gray-100 transition-colors">
            <Bell className="h-5 w-5 text-gray-500" />
          </button>
          
          <Link to={userRole === 'patient' ? "/patient/profile" : "/doctor/profile"} className="flex items-center gap-2">
            <div className="bg-gradient-to-r from-healthy-400 to-nature-500 p-0.5 rounded-full">
              <div className="bg-white rounded-full p-1">
                <User className="h-5 w-5 text-healthy-600" />
              </div>
            </div>
            <span className="hidden md:block text-sm font-medium">
              {userRole === 'patient' ? 'Patient Portal' : 'Doctor Portal'}
            </span>
          </Link>
        </div>
      </div>
    </header>
  );
};

export default Navbar;
