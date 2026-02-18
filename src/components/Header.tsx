import { Heart, Bell, User } from 'lucide-react';

const Header = () => {
  return (
    <header className="fixed top-0 w-full z-50 bg-white/90 backdrop-blur-md border-b border-gray-100 px-6 py-4">
      <div className="max-w-7xl mx-auto flex justify-between items-center">
        <div className="flex items-center gap-2 cursor-pointer">
          <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">H</div>
          <span className="text-black font-bold text-xl tracking-tighter">Homad</span>
        </div>
        <nav className="hidden md:flex items-center gap-10">
          {["Apartamentos","Habitaciones", "Servicios", "Contacto"].map((link) => (
            <a
              key={link}
              href={`#${link.toLowerCase()}`}
              className="text-gray-900 font-medium text-sm hover:text-black transition-colors"
            >
              {link}
            </a>
          ))}
        </nav>
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-black transition-colors cursor-pointer">
            <Heart size={20} />
          </div>
          <div className="flex items-center gap-1.5 px-3 py-2 text-gray-400 hover:text-black transition-colors cursor-pointer relative">
            <Bell size={20} />
            <span className="absolute top-1 right-2 w-2 h-2 bg-red-500 rounded-full border-2 border-white"></span>
          </div>

          <button className="homad-btn-secondary px-4 py-2">
            <User size={18} /> Iniciar sesión
          </button>

          <button className="homad-btn-primary px-5 py-2.5">
            Registrarse
          </button>
        </div>
      </div>
    </header>
  );
};

export default Header;