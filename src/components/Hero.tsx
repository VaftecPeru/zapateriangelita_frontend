import { Search, MapPin, Home, Calendar, ChevronDown } from 'lucide-react';

const Hero = () => (
  <section className="relative h-screen min-h-[700px] flex items-center justify-center pt-20 px-6 overflow-hidden">
    {/* Background with higher resolution city image */}
    <div className="absolute inset-0 z-0">
      <img
        src="https://images.unsplash.com/photo-1759850426415-8888ea55b07b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZSUyMGV2ZW5pbmd8ZW58MXx8fHwxNzcxMzc0MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
        className="w-full h-full object-cover brightness-[0.4]"
        alt="Modern City"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
    </div>

    <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
      <div className="text-center max-w-4xl mb-12">
        <h1 className="homad-h1 text-white mb-8">
          Encuentra tu espacio<br />
          <span className="text-gray-300">IDEAL</span>
        </h1>
        <p className="text-lg text-gray-300 max-w-2xl mx-auto leading-relaxed font-medium">
          Explora nuestra selección exclusiva de apartamentos y habitaciones premium con servicios incluidos para una estancia perfecta.
        </p>
      </div>

      {/* Main Search Bar - Conceptual redesign inspired by Image 1 */}
      <div className="w-full max-w-5xl -mb-24 px-4 md:px-0">
        <div className="bg-white rounded-3xl p-2 shadow-2xl overflow-hidden border border-white/20">
          <div className="grid grid-cols-1 md:grid-cols-4 items-center">

            {/* Ubicación */}
            <div className="p-6 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer hover:bg-gray-50 transition-colors">
              <label className="homad-input-label pl-0">Ubicación</label>
              <div className="flex items-center gap-2">
                <MapPin className="text-gray-400 group-hover:text-black transition-colors" size={18} />
                <input
                  type="text"
                  placeholder="¿A dónde vas?"
                  className="bg-transparent border-none outline-none text-sm font-bold text-black placeholder:text-gray-400 w-full"
                />
              </div>
            </div>

            {/* Tipo de propiedad */}
            <div className="p-6 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer hover:bg-gray-50 transition-colors">
              <label className="homad-input-label pl-0">Tipo de propiedad</label>
              <div className="flex items-center gap-2">
                <Home className="text-gray-400 group-hover:text-black transition-colors" size={18} />
                <div className="flex items-center justify-between w-full">
                  <span className="text-sm font-bold text-gray-400">Apartamento</span>
                  <ChevronDown size={14} className="text-gray-400" />
                </div>
              </div>
            </div>

            {/* Fecha */}
            <div className="p-6 flex flex-col gap-1 group cursor-pointer hover:bg-gray-50 transition-colors">
              <label className="homad-input-label pl-0">Fecha de entrada</label>
              <div className="flex items-center gap-2">
                <Calendar className="text-gray-400 group-hover:text-black transition-colors" size={18} />
                <span className="text-sm font-bold text-gray-400">Seleccionar fecha</span>
              </div>
            </div>

            {/* Botón Buscar */}
            <div className="p-2">
              <button className="homad-btn-primary w-full md:h-16 rounded-2xl">
                <Search size={20} /> Buscar
              </button>
            </div>

          </div>
        </div>

        {/* Advanced Filters & Scroll Hint */}
        <div className="mt-8 flex flex-col items-center gap-12">
          <button className="flex items-center gap-2 text-white/60 hover:text-white transition-colors text-xs font-bold uppercase tracking-[0.2em]">
            <span>Filtros avanzados</span>
            <div className="w-1.5 h-1.5 bg-white rounded-full" />
          </button>

          {/* Animated Scroll Indicator */}
          <div className="hidden md:flex flex-col items-center gap-4">
            <div className="w-[1px] h-12 bg-gradient-to-b from-white to-transparent" />
            <span className="text-[10px] text-white/40 uppercase tracking-[0.3em] font-medium animate-pulse">Explorar</span>
          </div>
        </div>
      </div>
    </div>
  </section>
);

export default Hero;