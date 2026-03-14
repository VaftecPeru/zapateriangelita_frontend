import { useState } from 'react';
import { Heart, Bell, User, LogOut, Menu, X, Square, Bed, Mail, Info, BarChart3 } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const location = useLocation();

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  if (isAuthPage) return null;

  return (
    <>
      <header className="fixed top-0 w-full z-[1000] bg-minimal-beige/95 backdrop-blur-md px-6 py-4">
        <div className="max-w-7xl mx-auto flex justify-between items-center">

          <Link to="/" className="flex items-center gap-2 cursor-pointer relative z-50">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">H</div>
            <span className="text-black font-bold text-xl tracking-tighter">Homad</span>
          </Link>


          <nav className="hidden md:flex items-center gap-10">
            {[
              { label: "Apartamentos", href: "/properties" },
              { label: "Habitaciones", href: "/properties" },
              { label: "Servicios", id: "servicios" },
              { label: "Sobre nosotros", href: "/about" },
              { label: "Contacto", id: "contacto" }
            ].map((link) => (
              link.href ? (
                <Link
                  key={link.label}
                  to={link.href}
                  className="text-gray-900 font-bold text-sm hover:text-black active:scale-95 transition-all duration-300 relative group py-2"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={`/#${link.id}`}
                  className="text-gray-900 font-bold text-sm hover:text-black active:scale-95 transition-all duration-300 relative group py-2"
                >
                  {link.label}
                  <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-black transition-all duration-300 group-hover:w-full"></span>
                </a>
              )
            ))}
          </nav>


          <div className="flex items-center gap-1 md:gap-4">
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-2 text-red-500 hover:bg-red-50 hover:scale-110 active:scale-90 rounded-xl transition-all cursor-pointer">
              <Heart size={20} className="fill-red-500" />
            </div>
            <div className="flex items-center gap-1.5 px-2 md:px-3 py-2 text-black/50 hover:text-black hover:bg-black/5 hover:scale-110 active:scale-90 rounded-xl transition-all cursor-pointer relative">
              <Bell size={20} />
              <span className="absolute top-2 right-2 md:right-3 w-2 h-2 bg-black rounded-full border-2 border-minimal-beige"></span>
            </div>


            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className="homad-btn-secondary px-5 py-2.5 flex items-center gap-2 hover:bg-black hover:text-white hover:scale-105 active:scale-95 border-black transition-all duration-300"
                  >
                    <User size={18} /> Iniciar sesión
                  </Link>

                  <Link
                    to="/register"
                    className="bg-minimal-olive text-white px-5 py-2.5 rounded-xl text-sm font-bold hover:bg-minimal-olive/80 hover:scale-105 transition-all active:scale-95 flex items-center justify-center gap-2"
                  >
                    Registrarse
                  </Link>
                </>
              ) : (
                <div className="relative">
                  <button
                    onClick={() => setIsProfileOpen(!isProfileOpen)}
                    className="flex items-center gap-3 px-3 py-1.5 hover:bg-black/5 rounded-2xl transition-all group active:scale-95"
                  >
                    <div className="flex flex-col items-end leading-tight">
                      <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest group-hover:text-black/40 transition-colors">Hola,</span>
                      <span className="text-sm font-black text-black">{user?.name.split(' ')[0]}</span>
                    </div>
                    <div className="w-10 h-10 bg-black rounded-xl flex items-center justify-center text-white font-black text-sm border border-black group-hover:bg-white group-hover:text-black transition-all shadow-lg shadow-black/5">
                      {user ? getInitials(user.name) : '??'}
                    </div>
                  </button>

                  {/* Dropdown Menu */}
                  {isProfileOpen && (
                    <>
                      <div
                        className="fixed inset-0 z-40"
                        onClick={() => setIsProfileOpen(false)}
                      ></div>
                      <div className="absolute right-0 mt-3 w-56 bg-white rounded-2xl shadow-2xl border border-gray-100 py-3 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                        <div className="px-5 py-3 border-b border-gray-50 mb-2">
                          <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Mi Cuenta</p>
                          <p className="text-sm font-bold text-black truncate">{user?.email}</p>
                        </div>
                        {user?.role === 'admin' && (
                          <Link
                            to="/admin/dashboard"
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-minimal-olive hover:bg-minimal-olive/5 transition-colors"
                            onClick={() => setIsProfileOpen(false)}
                          >
                            <BarChart3 size={18} /> Dashboard Admin
                          </Link>
                        )}
                        <Link
                          to="/profile"
                          className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-gray-600 hover:text-black hover:bg-gray-50 transition-colors"
                          onClick={() => setIsProfileOpen(false)}
                        >
                          <User size={18} /> Ver Perfil
                        </Link>
                        <button
                          onClick={() => {
                            logout();
                            setIsProfileOpen(false);
                          }}
                          className="w-full flex items-center gap-3 px-5 py-3 text-sm font-bold text-red-500 hover:bg-red-50 active:scale-95 transition-all mt-2 border-t border-gray-50 pt-4"
                        >
                          <LogOut size={18} /> Cerrar Sesión
                        </button>
                      </div>
                    </>
                  )}
                </div>
              )}
            </div>


            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-black hover:bg-gray-50 rounded-lg transition-colors relative z-50"
            >
              {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
            </button>
          </div>
        </div>
      </header>


      <div className={`fixed inset-0 bg-white z-[9999] transition-transform duration-500 ease-in-out md:hidden ${isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'}`}>
        <div className="flex flex-col h-full pt-32 px-8 pb-10">
          <div className="absolute top-8 right-8">
            <button
              onClick={() => setIsMobileMenuOpen(false)}
              className="p-2 text-black hover:bg-gray-50 rounded-lg transition-colors"
            >
              <X size={32} />
            </button>
          </div>
          <div className="absolute top-8 left-8 flex items-center gap-2">
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">H</div>
            <span className="text-black font-bold text-xl tracking-tighter">Homad</span>
          </div>
          <nav className="flex flex-col gap-2">
            {[
              { label: "Apartamentos", icon: <Square size={22} />, id: "apartamentos" },
              { label: "Habitaciones", icon: <Bed size={22} />, id: "apartamentos" },
              { label: "Servicios", icon: <Bell size={22} />, id: "servicios" },
              { label: "Sobre nosotros", icon: <Info size={22} />, href: "/about" },
              { label: "Contacto", icon: <Mail size={22} />, id: "contacto" }
            ].map((link) => (
              link.href ? (
                <Link
                  key={link.label}
                  to={link.href}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-black text-black py-5 border-b border-gray-100/50 active:bg-gray-50 rounded-xl px-2 transition-colors"
                >
                  <span className="text-gray-400">{link.icon}</span>
                  {link.label}
                </Link>
              ) : (
                <a
                  key={link.label}
                  href={`/#${link.id}`}
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="flex items-center gap-4 text-xl font-black text-black py-5 border-b border-gray-100/50 active:bg-gray-50 rounded-xl px-2 transition-colors"
                >
                  <span className="text-gray-400">{link.icon}</span>
                  {link.label}
                </a>
              )
            ))}
          </nav>

          <div className="mt-auto space-y-4">
            {!isAuthenticated ? (
              <div className="grid grid-cols-1 gap-4">
                <Link
                  to="/login"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-gray-100 text-black py-5 rounded-2xl text-lg font-bold flex items-center justify-center gap-3 active:scale-[0.98] transition-all"
                >
                  <User size={22} /> Iniciar sesión
                </Link>

                <Link
                  to="/register"
                  onClick={() => setIsMobileMenuOpen(false)}
                  className="w-full bg-minimal-olive text-white py-5 rounded-2xl text-lg font-bold active:scale-[0.98] transition-all shadow-xl shadow-minimal-olive/10 flex items-center justify-center"
                >
                  Registrar cuenta
                </Link>
              </div>
            ) : (
              <div className="p-8 bg-gray-50/50 rounded-[2.5rem] border border-gray-100">
                <div className="flex items-center gap-4 mb-8">
                  <div className="w-16 h-16 bg-black rounded-2xl flex items-center justify-center text-white font-black text-xl border border-black">
                    {user ? getInitials(user.name) : '??'}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-400 font-black uppercase tracking-[0.2em] block mb-1">Sesión activa</span>
                    <span className="text-2xl font-black text-black tracking-tighter">{user?.name.split(' ')[0]}</span>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <Link
                    to="/profile"
                    onClick={() => setIsMobileMenuOpen(false)}
                    className="flex flex-col items-center justify-center gap-2 bg-white p-5 rounded-2xl font-black text-sm border border-gray-100 active:scale-95 transition-all shadow-sm"
                  >
                    <User size={20} className="text-gray-400" />
                    Perfil
                  </Link>
                  <button
                    onClick={() => {
                      logout();
                      setIsMobileMenuOpen(false);
                    }}
                    className="flex flex-col items-center justify-center gap-2 bg-red-50 p-5 rounded-2xl font-black text-sm border border-red-100 text-red-500 active:scale-95 transition-all shadow-sm"
                  >
                    <LogOut size={20} />
                    Salir
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
