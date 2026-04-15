import { Link, useNavigate } from 'react-router-dom';
import { Droplets, Bell, User as UserIcon, LogOut } from 'lucide-react';
import { useAuthStore } from '../../stores/authStore';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "../ui/dropdown-menu";

const Navbar = () => {
  const { user, isAuthenticated, logout } = useAuthStore();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav className="fixed top-0 left-0 right-0 h-16 bg-white border-b border-gray-200 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-full flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center space-x-2">
          <Droplets className="h-8 w-8 text-primary-600" />
          <span className="text-xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-primary-600 to-primary-400 hidden sm:block">
            AquaGuard
          </span>
        </Link>

        {/* Right side */}
        <div className="flex items-center space-x-4">
          {isAuthenticated && user ? (
            <>
              {/* Points Badge (Citizen) */}
              {user.role === 'CITIZEN' && (
                <div className="hidden sm:flex items-center bg-blue-50 text-primary-700 px-3 py-1 rounded-full text-sm font-medium border border-blue-100">
                  <Droplets className="h-4 w-4 mr-1 text-primary-500" />
                  {user.points} pts
                </div>
              )}

              {/* Notifications */}
              <button className="p-2 text-gray-500 hover:text-primary-600 hover:bg-gray-100 rounded-full transition-colors relative">
                <Bell className="h-5 w-5" />
                <span className="absolute top-1.5 right-1.5 h-2 w-2 bg-red-500 rounded-full ring-2 ring-white"></span>
              </button>

              {/* Profile Dropdown */}
              <DropdownMenu>
                <DropdownMenuTrigger className="focus:outline-none">
                  <div className="h-9 w-9 bg-gray-100 rounded-full flex items-center justify-center border border-gray-200 hover:border-primary-300 transition-colors">
                    <UserIcon className="h-5 w-5 text-gray-600" />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-56">
                  <DropdownMenuLabel>
                    <div className="flex flex-col space-y-1">
                      <p className="font-medium leading-none">{user.name}</p>
                      <p className="text-xs text-gray-500 leading-none">{user.email || user.phone}</p>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'CITIZEN' && (
                    <DropdownMenuItem className="sm:hidden text-primary-600 font-medium">
                      Points: {user.points}
                    </DropdownMenuItem>
                  )}
                  <DropdownMenuItem>Profile Settings</DropdownMenuItem>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout} className="text-red-600 cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Log Out
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          ) : (
            <Link to="/login" className="btn-primary">
              Login
            </Link>
          )}
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
