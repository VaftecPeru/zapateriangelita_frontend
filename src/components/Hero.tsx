import { useState } from 'react';
import { Search, MapPin, Home, Calendar, ChevronDown } from 'lucide-react';

const Hero = ({ onSearch }: { onSearch: (criteria: any) => void }) => {
  const [formData, setFormData] = useState({
    location: '',
    propertyType: '',
    date: ''
  });

  const handleSearch = () => {
    onSearch(formData);
    // Scroll to results
    const resultsSection = document.getElementById('apartamentos');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-[90vh] md:h-[65vh] min-h-[600px] flex items-center justify-center pt-32 md:pt-40 px-6 overflow-hidden">

      <div className="absolute inset-0 z-0">
        <img
          src="https://images.unsplash.com/photo-1759850426415-8888ea55b07b?crop=entropy&cs=tinysrgb&fit=max&fm=jpg&ixid=M3w3Nzg4Nzd8MHwxfHNlYXJjaHwxfHxtb2Rlcm4lMjBjaXR5JTIwc2t5bGluZSUyMGV2ZW5pbmd8ZW58MXx8fHwxNzcxMzc0MjM5fDA&ixlib=rb-4.1.0&q=80&w=1080&utm_source=figma&utm_medium=referral"
          className="w-full h-full object-cover brightness-[0.4]"
          alt="Modern City"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/40" />
      </div>

      <div className="relative z-10 w-full max-w-7xl mx-auto flex flex-col items-center">
        <div className="text-center max-w-4xl mb-12 md:mb-16">
          <h1 className="umbralsuites-h1 text-white mb-8 drop-shadow-2xl">
            Encuentra tu espacio<br />
            <span className="relative inline-block animate-underline-grow mt-2 text-minimal-beige drop-shadow-xl px-4 transition-all duration-700">
              Ideal
            </span>
          </h1>
          <p className="text-xl text-gray-200/90 max-w-2xl mx-auto leading-relaxed font-semibold drop-shadow-md">
            Explora nuestra selección exclusiva de apartamentos y habitaciones premium con servicios incluidos para una estancia perfecta.
          </p>
        </div>

        <div className="w-full max-w-5xl -mb-6 md:-mb-12 px-4 md:px-0 relative z-50">
          <div className="bg-white rounded-2xl p-2 shadow-sm border border-black overflow-hidden">
            <div className="grid grid-cols-1 md:grid-cols-4 items-center">


              <div className="p-5 md:p-6 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer hover:bg-gray-50 transition-colors">
                <label className="umbralsuites-input-label pl-0">Ubicación</label>
                <div className="flex items-center gap-2">
                  <MapPin className="text-gray-400 group-hover:text-black transition-colors" size={18} />
                  <input
                    type="text"
                    placeholder="¿A dónde vas?"
                    value={formData.location}
                    onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                    className="bg-transparent border-none outline-none text-sm font-bold text-black placeholder:text-gray-400 w-full"
                  />
                </div>
              </div>


              <div className="p-5 md:p-6 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer hover:bg-gray-50 transition-colors relative">
                <label className="umbralsuites-input-label pl-0">Tipo de propiedad</label>
                <div className="flex items-center gap-2">
                  <Home className="text-gray-400 group-hover:text-black transition-colors" size={18} />
                  <div className="relative w-full">
                    <select
                      value={formData.propertyType}
                      onChange={(e) => setFormData({ ...formData, propertyType: e.target.value })}
                      className={`appearance-none bg-transparent border-none outline-none text-sm font-bold w-full cursor-pointer pr-8 ${formData.propertyType === '' ? 'text-gray-400' : 'text-black'}`}
                    >
                      <option value="" disabled hidden>Elegir</option>
                      <option value="Apartamento" className="text-black">Apartamentos</option>
                      <option value="Habitación" className="text-black">Habitaciones</option>
                    </select>
                    <ChevronDown size={14} className="text-gray-400 absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none" />
                  </div>
                </div>
              </div>


              <div className="p-5 md:p-6 flex flex-col gap-1 border-b md:border-b-0 md:border-r border-gray-100 group cursor-pointer hover:bg-gray-50 transition-colors">
                <label className="umbralsuites-input-label pl-0">Fecha de entrada</label>
                <div className="flex items-center gap-2">
                  <Calendar className="text-gray-400 group-hover:text-black transition-colors" size={18} />
                  <input
                    type="date"
                    value={formData.date}
                    onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                    className="bg-transparent border-none outline-none text-sm font-bold text-black w-full cursor-pointer placeholder:text-gray-400"
                  />
                </div>
              </div>

              <div className="p-2">
                <button
                  onClick={handleSearch}
                  className="bg-black text-white w-full h-14 md:h-16 rounded-xl font-bold hover:bg-minimal-olive hover:text-white hover:scale-[1.02] border border-black transition-all active:scale-[0.98] flex items-center justify-center gap-2 shadow-lg hover:shadow-minimal-olive/20"
                >
                  <Search size={20} /> Buscar
                </button>
              </div>

            </div>
          </div>

          <div className="mt-8 flex flex-col items-center gap-4">
            <div className="hidden md:flex flex-col items-center gap-4">
              <div className="w-[1px] h-12 bg-black/20" />
              <span className="text-[10px] text-black uppercase tracking-[0.3em] font-medium animate-pulse">Explorar</span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
};

export default Hero;
