import { useState, useEffect } from 'react';
import { Heart, Bell, User, LogOut, Menu, X, Square, Mail, Info, BarChart3, Home, Clock, Flame, ChevronDown } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import { Link, useLocation } from 'react-router-dom';
import { leadService, Lead } from '../services/crudService';

const Header = () => {
  const { user, logout, isAuthenticated } = useAuth();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState<string | null>(null);
  const [activeMobileSubmenu, setActiveMobileSubmenu] = useState<string | null>(null);
  const [leads, setLeads] = useState<Lead[]>([]);
  const [unreadCount, setUnreadCount] = useState(0);

  const location = useLocation();
  const isHome = location.pathname === '/';
  const isAuthPage = location.pathname === '/login' || location.pathname === '/register';

  useEffect(() => {
    if (isAuthenticated && user?.role === 'admin') {
      fetchLeads();
      const interval = setInterval(fetchLeads, 60000); // Check every minute
      return () => clearInterval(interval);
    }
  }, [isAuthenticated, user]);

  const fetchLeads = async () => {
    try {
      const res = await leadService.getAll();
      const data = (res.data as any)?.data ?? res.data;
      if (Array.isArray(data)) {
        setLeads(data.slice(0, 5)); // Show only 5 most recent
        setUnreadCount(data.filter(l => !l.is_read).length);
      }
    } catch (e) {
      console.error('Error fetching leads for notifications', e);
    }
  };

  const getInitials = (name: string) => {
    const parts = name.split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  if (isAuthPage) return null;

  const isDarkText = !isHome;

  return (
    <>
      <header className={`absolute top-0 w-full z-[1000] px-6 md:px-12 py-6 bg-transparent`}>
        <div className="max-w-[90rem] mx-auto flex justify-between items-center">

          <Link to="/" className="flex items-center gap-2 cursor-pointer relative z-50">
            <div className={`w-8 h-8 ${isDarkText ? 'bg-black text-white' : 'bg-white text-black'} rounded flex items-center justify-center font-bold transition-colors shadow-sm`}>U</div>
            <span className={`${isDarkText ? 'text-black' : 'text-white'} font-bold text-xl tracking-tighter drop-shadow-md transition-colors`}>Umbral Suites</span>
          </Link>
          
          <nav className="hidden md:flex items-center gap-8">
            <Link
              to="/?offer=true"
              className={`flex items-center gap-2 px-4 py-2 rounded-full border border-orange-500/30 bg-orange-500/10 text-orange-500 font-black text-sm hover:bg-orange-500 hover:text-white transition-all duration-300 active:scale-95 group shadow-sm`}
            >
              <Flame size={16} className="fill-orange-500 group-hover:fill-white transition-colors" />
              Ofertas únicas
            </Link>

            {[
              { 
                label: "Propiedades", 
                href: "/properties",
                dropdown: [
                  { label: "Departamentos", href: "/properties?category=departamento" },
                  { label: "Suites de Lujo", href: "/properties?category=suite" },
                  { label: "Estudios de Diseño", href: "/properties?category=estudio" },
                  { label: "Catálogo Completo", href: "/properties", highlight: true }
                ]
              },
              { label: "Sobre nosotros", href: "/about" },
              { label: "Contacto", id: "contacto" }
            ].map((link: any) => (
              <div 
                key={link.label} 
                className="relative group h-full flex items-center"
                onMouseEnter={() => link.dropdown && setOpenDropdown(link.label)}
                onMouseLeave={() => setOpenDropdown(null)}
              >
                {link.href ? (
                  <Link
                    to={link.href}
                    className={`${isDarkText ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'} flex items-center gap-1 font-bold text-base active:scale-95 transition-all duration-300 relative py-2 drop-shadow-md`}
                  >
                    {link.label}
                    {link.dropdown && <ChevronDown size={14} className={`mt-0.5 transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />}
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDarkText ? 'bg-black' : 'bg-white'} transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100`}></span>
                  </Link>
                ) : (
                  <a
                    href={`/#${link.id}`}
                    className={`${isDarkText ? 'text-black/80 hover:text-black' : 'text-white/90 hover:text-white'} flex items-center gap-1 font-bold text-base active:scale-95 transition-all duration-300 relative py-2 drop-shadow-md`}
                  >
                    {link.label}
                    {link.dropdown && <ChevronDown size={14} className={`mt-0.5 transition-transform duration-300 ${openDropdown === link.label ? 'rotate-180' : ''}`} />}
                    <span className={`absolute bottom-0 left-0 w-0 h-0.5 ${isDarkText ? 'bg-black' : 'bg-white'} transition-all duration-300 group-hover:w-full opacity-0 group-hover:opacity-100`}></span>
                  </a>
                )}

                {link.dropdown && openDropdown === link.label && (
                  <div className="absolute top-[100%] left-0 pt-2 min-w-[220px] z-[1100] animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="bg-[#1c1c1c] text-white rounded-[1.5rem] shadow-2xl border border-white/5 py-4 px-2 ring-1 ring-black/5">
                      {link.dropdown.map((subItem: any) => (
                        <Link
                          key={subItem.label}
                          to={subItem.href}
                          onClick={() => setOpenDropdown(null)}
                          className={`block w-full text-left px-5 py-3 rounded-xl text-sm font-bold transition-all hover:bg-white/10 ${subItem.highlight ? 'text-orange-400 mt-2 pt-4 border-t border-white/5' : 'text-white/80 hover:text-white'}`}
                        >
                          {subItem.label}
                        </Link>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </nav>


          <div className="flex items-center gap-1 md:gap-4">
            <div className={`flex items-center gap-1.5 px-2 md:px-3 py-2 text-red-500 hover:bg-black/5 hover:scale-110 active:scale-90 rounded-xl transition-all cursor-pointer`}>
              <Heart size={20} className="fill-red-500 drop-shadow-md" />
            </div>
            
            <div className="relative">
              <button 
                onClick={() => setIsNotificationsOpen(!isNotificationsOpen)}
                className={`flex items-center gap-1.5 px-2 md:px-3 py-2 ${isDarkText ? 'text-black/80 hover:text-black' : 'text-white/80 hover:text-white'} hover:bg-black/5 hover:scale-110 active:scale-90 rounded-xl transition-all cursor-pointer relative drop-shadow-md`}
              >
                <Bell size={20} />
                {unreadCount > 0 && (
                  <span className={`absolute top-1.5 right-1.5 md:right-2 w-4 h-4 bg-red-500 text-white text-[8px] font-black flex items-center justify-center rounded-full border-2 border-white animate-bounce`}>
                    {unreadCount}
                  </span>
                )}
              </button>

              {isNotificationsOpen && (
                <>
                  <div className="fixed inset-0 z-40" onClick={() => setIsNotificationsOpen(false)}></div>
                  <div className="absolute right-0 mt-3 w-80 bg-white rounded-[2rem] shadow-2xl border border-gray-100 py-4 z-50 animate-in fade-in slide-in-from-top-2 duration-200">
                    <div className="px-6 py-2 border-b border-gray-50 mb-3 flex justify-between items-center">
                      <div>
                        <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Notificaciones</p>
                        <h4 className="text-sm font-black text-black">Mensajes Recientes</h4>
                      </div>
                      {unreadCount > 0 && <span className="bg-minimal-gold/10 text-minimal-gold text-[10px] font-black px-2 py-0.5 rounded-full">{unreadCount} nuevos</span>}
                    </div>
                    
                    <div className="max-h-[350px] overflow-y-auto px-2 space-y-1">
                      {leads.length > 0 ? (
                        leads.map((lead) => (
                          <Link 
                            key={lead.id} 
                            to="/admin/dashboard" 
                            state={{ activeTab: 'messages', selectedLeadId: lead.id }}
                            onClick={() => setIsNotificationsOpen(false)}
                            className={`flex items-start gap-3 p-4 rounded-[1.5rem] transition-all hover:bg-gray-50 group ${!lead.is_read ? 'bg-minimal-gold/[0.03]' : ''}`}
                          >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center font-black text-xs shrink-0 shadow-sm ${!lead.is_read ? 'bg-minimal-gold text-white' : 'bg-gray-100 text-gray-400'}`}>
                              {(lead.first_name?.[0] ?? '?').toUpperCase()}
                            </div>
                            <div className="flex-1 min-w-0">
                               <div className="flex justify-between items-start">
                                  <p className={`text-xs text-black truncate ${!lead.is_read ? 'font-black' : 'font-bold'}`}>
                                    {lead.first_name} {lead.last_name}
                                  </p>
                                  <span className="text-[8px] text-gray-300 font-bold uppercase shrink-0"><Clock size={8} className="inline mr-0.5" />{new Date(lead.created_at!).toLocaleDateString()}</span>
                               </div>
                               <p className="text-[10px] text-gray-400 font-medium truncate mt-0.5 flex items-center gap-1">
                                  <Home size={10} className="text-minimal-gold" /> {lead.property_title ?? 'Sin título'}
                               </p>
                               {!lead.is_read && (
                                 <div className="mt-2 flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 bg-minimal-gold rounded-full"></span>
                                    <span className="text-[8px] font-black text-minimal-gold uppercase tracking-widest">Nuevo mensaje</span>
                                 </div>
                               )}
                            </div>
                          </Link>
                        ))
                      ) : (
                        <div className="py-10 text-center">
                          <Mail className="mx-auto text-gray-200 mb-2" size={32} />
                          <p className="text-xs text-gray-400 font-bold">No hay notificaciones</p>
                        </div>
                      )}
                    </div>

                    <div className="mt-3 pt-3 border-t border-gray-50 px-6">
                      <Link 
                        to="/admin/dashboard" 
                        state={{ activeTab: 'messages' }}
                        onClick={() => setIsNotificationsOpen(false)}
                        className="block w-full text-center py-2 bg-black text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-minimal-olive transition-all"
                      >
                        Ver todos los mensajes
                      </Link>
                    </div>
                  </div>
                </>
              )}
            </div>


            <div className="hidden md:flex items-center gap-3">
              {!isAuthenticated ? (
                <>
                  <Link
                    to="/login"
                    className={`${isDarkText ? 'text-black/80 hover:text-black' : 'text-white hover:text-white/80'} font-bold text-sm transition-colors flex items-center gap-2 drop-shadow-md mr-2`}
                  >
                    <User size={18} /> Iniciar sesión
                  </Link>

                  <Link
                    to="/register"
                    className={`${isDarkText ? 'bg-black text-white' : 'bg-black/40 text-white'} backdrop-blur-md border border-white/20 px-6 py-2.5 rounded-xl text-sm font-bold hover:bg-black/90 hover:border-white/40 hover:scale-105 transition-all active:scale-95 flex items-center justify-center`}
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
                      <span className={`text-sm font-black ${isDarkText ? 'text-black' : 'text-white'}`}>{user?.name.split(' ')[0]}</span>
                    </div>
                    <div className={`w-10 h-10 ${isDarkText ? 'bg-black' : 'bg-white'} rounded-xl flex items-center justify-center ${isDarkText ? 'text-white' : 'text-black'} font-black text-sm border border-black/10 group-hover:bg-black group-hover:text-white transition-all shadow-lg shadow-black/5`}>
                      {user ? getInitials(user.name) : '??'}
                    </div>
                  </button>

                  
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
                            className="flex items-center gap-3 px-5 py-3 text-sm font-bold text-minimal-gold hover:bg-minimal-gold/5 transition-colors"
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
              className={`md:hidden p-2 ${isDarkText ? 'text-black' : 'text-white'} hover:bg-black/5 rounded-lg transition-colors relative z-50 drop-shadow-md`}
            >
              {isMobileMenuOpen ? <X size={24} className="text-black" /> : <Menu size={24} />}
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
            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">U</div>
            <span className="text-black font-bold text-xl tracking-tighter">Umbral Suites</span>
          </div>
          <nav className="flex flex-col gap-1">
            {[
              { label: "Ofertas únicas", icon: <Flame size={20} className="text-orange-500" />, href: "/?offer=true" },
              { 
                label: "Propiedades", 
                icon: <Square size={20} />, 
                dropdown: [
                  { label: "Departamentos", href: "/properties?category=departamento" },
                  { label: "Suites de Lujo", href: "/properties?category=suite" },
                  { label: "Estudios de Diseño", href: "/properties?category=estudio" },
                  { label: "Catálogo Completo", href: "/properties" }
                ]
              },
              { label: "Sobre nosotros", icon: <Info size={20} />, href: "/about" },
              { label: "Contacto", icon: <Mail size={20} />, id: "contacto" }
            ].map((link: any) => (
              <div key={link.label} className="border-b border-gray-50 last:border-0">
                {link.dropdown ? (
                  <>
                    <button
                      onClick={() => setActiveMobileSubmenu(activeMobileSubmenu === link.label ? null : link.label)}
                      className="w-full flex items-center justify-between gap-4 text-lg font-black text-black py-4 active:bg-gray-50 rounded-xl px-2 transition-colors"
                    >
                      <div className="flex items-center gap-4">
                        <span className="text-gray-400">{link.icon}</span>
                        {link.label}
                      </div>
                      <ChevronDown size={20} className={`text-gray-400 transition-transform duration-300 ${activeMobileSubmenu === link.label ? 'rotate-180' : ''}`} />
                    </button>
                    
                    {activeMobileSubmenu === link.label && (
                      <div className="flex flex-col gap-1 pl-12 pb-4 animate-in fade-in slide-in-from-top-2 duration-200">
                        {link.dropdown.map((subItem: any) => (
                          <Link
                            key={subItem.label}
                            to={subItem.href}
                            onClick={() => {
                              setIsMobileMenuOpen(false);
                              setActiveMobileSubmenu(null);
                            }}
                            className="text-sm font-bold text-gray-500 py-3 hover:text-black transition-colors"
                          >
                            {subItem.label}
                          </Link>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  link.href ? (
                    <Link
                      to={link.href}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-lg font-black text-black py-4 active:bg-gray-50 rounded-xl px-2 transition-colors"
                    >
                      <span className="text-gray-400">{link.icon}</span>
                      {link.label}
                    </Link>
                  ) : (
                    <a
                      href={`/#${link.id}`}
                      onClick={() => setIsMobileMenuOpen(false)}
                      className="flex items-center gap-4 text-lg font-black text-black py-4 active:bg-gray-50 rounded-xl px-2 transition-colors"
                    >
                      <span className="text-gray-400">{link.icon}</span>
                      {link.label}
                    </a>
                  )
                )}
              </div>
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
