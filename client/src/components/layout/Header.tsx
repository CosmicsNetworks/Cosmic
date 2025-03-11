import { useAuth } from '@/lib/authContext';
import { useModal } from '@/lib/modalContext';
import { Button } from '@/components/ui/button';
import { Star, Settings, LogIn, LogOut, Shield } from 'lucide-react';

const Header = () => {
  const { user, isAuthenticated, logout, premiumStatus } = useAuth();
  const { openModal } = useModal();
  
  return (
    <header className="relative mb-14 pt-4">
      {/* Top action buttons: Login/Signup, Premium, Settings */}
      <div className="absolute top-0 right-2 z-20 flex items-center gap-2">
        {isAuthenticated ? (
          <>
            <div className="hidden sm:block mr-2">
              <span className="text-xs text-gray-400">
                Hello, <span className="text-indigo-400">{user?.username}</span>
              </span>
            </div>
            
            {/* Premium badge or get premium button */}
            {premiumStatus?.isPremium ? (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 bg-black/20 border border-yellow-500/30 text-yellow-400 hover:text-yellow-300 hover:bg-black/30 px-2"
                onClick={() => openModal('premium')}
              >
                <Star className="h-3.5 w-3.5 mr-1 fill-yellow-500 text-yellow-500" /> Premium
              </Button>
            ) : (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 bg-black/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-black/30"
                onClick={() => openModal('premium')}
              >
                <Star className="h-3.5 w-3.5 mr-1" /> Get Premium
              </Button>
            )}
            
            {/* Admin panel button - only for admins */}
            {user?.role === 'admin' && (
              <Button 
                variant="ghost" 
                size="sm" 
                className="h-8 bg-black/20 border border-red-500/30 text-red-400 hover:text-red-300 hover:bg-black/30"
                onClick={() => openModal('adminPanel')}
              >
                <Shield className="h-3.5 w-3.5 mr-1" /> Admin
              </Button>
            )}
            
            {/* Settings button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-black/20 border border-blue-500/30 text-blue-400 hover:text-blue-300 hover:bg-black/30"
              onClick={() => openModal('settings')}
            >
              <Settings className="h-4 w-4" />
            </Button>
            
            {/* Logout button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0 bg-black/20 border border-pink-500/30 text-pink-400 hover:text-pink-300 hover:bg-black/30"
              onClick={logout}
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </>
        ) : (
          <>
            {/* Login button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 bg-black/20 border border-indigo-500/30 text-indigo-400 hover:text-indigo-300 hover:bg-black/30"
              onClick={() => openModal('login')}
            >
              <LogIn className="h-3.5 w-3.5 mr-1" /> Login
            </Button>
            
            {/* Premium button */}
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 bg-black/20 border border-purple-500/30 text-purple-400 hover:text-purple-300 hover:bg-black/30"
              onClick={() => openModal('premium')}
            >
              <Star className="h-3.5 w-3.5 mr-1" /> Premium
            </Button>
          </>
        )}
      </div>
      
      {/* Main header with logo */}
      <div className="text-center relative">
        {/* Glow effect behind the logo */}
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-32 h-32 bg-purple-500/20 rounded-full blur-3xl"></div>
        
        <div className="relative z-10">
          <div className="flex justify-center items-center gap-3 mb-3">
            {/* Planet logo with rings */}
            <div className="relative w-12 h-12">
              {/* Outer ring with subtle animation */}
              <div className="absolute inset-0 border-2 border-purple-400/30 rounded-full animate-[spin_12s_linear_infinite]"></div>
              {/* Middle ring */}
              <div className="absolute inset-1 border border-indigo-400/40 rounded-full animate-[spin_8s_linear_infinite]" style={{ transform: 'rotateX(70deg)' }}></div>
              {/* Inner planet with glow */}
              <div className="absolute inset-2 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-full shadow-lg shadow-purple-500/30 animate-pulse"></div>
              {/* Sparkle effect */}
              <div className="absolute top-1 right-1 w-1.5 h-1.5 bg-white rounded-full animate-ping"></div>
            </div>
            
            <h1 className="font-heading text-4xl md:text-6xl font-bold">
              <span className="bg-gradient-to-r from-purple-400 via-fuchsia-500 to-indigo-400 bg-clip-text text-transparent drop-shadow-sm">
                Cosmic
              </span>
              <span className="bg-gradient-to-r from-indigo-400 via-cyan-500 to-purple-400 bg-clip-text text-transparent">
                Link
              </span>
            </h1>
          </div>
          
          <p className="text-slate-300 text-lg relative z-10">
            <span className="opacity-80">Explore the vast universe of the web</span> 
            <span className="px-1.5 py-0.5 bg-slate-800/60 rounded ml-1 text-xs text-purple-300 uppercase tracking-wider border border-slate-700/70">
              Educational Use Only
            </span>
          </p>
        </div>
      </div>
    </header>
  );
};

export default Header;
