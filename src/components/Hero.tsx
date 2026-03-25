import { useState, useEffect } from 'react';
import { Search, MapPin, Home, ChevronDown } from 'lucide-react';
import fotoportada from '../assets/fotoportada.png';

const Hero = ({ onSearch, properties = [] }: { onSearch: (criteria: any) => void, properties?: any[] }) => {
  const [formData, setFormData] = useState({
    location: '',
    propertyType: '',
    date: ''
  });
  const [errors, setErrors] = useState({
    location: false,
    propertyType: false
  });

  const FULL_TITLE = '¡Bienvenidos a Umbral Suites!';
  const [typedTitle, setTypedTitle] = useState('');
  const [typingDone, setTypingDone] = useState(false);

  // Get today's date in YYYY-MM-DD format to disable past dates
  const getTodayDate = () => {
    const today = new Date();
    return today.toISOString().split('T')[0];
  };

  useEffect(() => {
    let i = 0;
    const interval = setInterval(() => {
      if (i < FULL_TITLE.length) {
        setTypedTitle(FULL_TITLE.slice(0, i + 1));
        i++;
      } else {
        setTypingDone(true);
        clearInterval(interval);
      }
    }, 55);
    return () => clearInterval(interval);
  }, []);

  const handleSearch = () => {
    const hasLocationMatch = !formData.location || properties.some(p =>
      (p.location || '').toLowerCase().includes(formData.location.toLowerCase())
    );

    const hasTypeMatch = !formData.propertyType || properties.some(p =>
      p.type === formData.propertyType
    );

    if (!hasLocationMatch || !hasTypeMatch) {
      setErrors({
        location: !hasLocationMatch,
        propertyType: !hasTypeMatch
      });

      setTimeout(() => {
        setErrors({ location: false, propertyType: false });
      }, 3000);

      return;
    }

    setErrors({ location: false, propertyType: false });
    onSearch(formData);

    const resultsSection = document.getElementById('apartamentos');
    if (resultsSection) {
      resultsSection.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <section className="relative h-screen min-h-[600px] flex flex-col justify-center px-6 md:px-12 overflow-hidden">

      <div className="absolute inset-0 z-0">
        <img
          src={fotoportada}
          className="w-full h-full object-cover brightness-[0.7]"
          alt="Umbral Suites"
        />
        <div className="absolute inset-0 bg-gradient-to-b from-black/60 via-transparent to-black/80" />
      </div>

      <div className="relative z-10 w-full max-w-[90rem] mx-auto flex flex-col justify-center h-full px-6 md:px-12 pt-32 pb-12">


        <div className="w-full max-w-5xl mx-auto mb-6 md:mb-10 mt-16">
          <div className="w-full bg-black/40 backdrop-blur-md rounded-[2.5rem] md:rounded-full shadow-2xl border border-white/20 p-1">
            <div className="flex flex-col md:flex-row items-center">


              <div className={`w-full md:w-auto flex-1 p-2 md:p-3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 group cursor-pointer transition-colors ${errors.location ? 'bg-red-500/20 rounded-t-[2rem] md:rounded-t-none md:rounded-l-full' : 'hover:bg-white/5 rounded-t-[2rem] md:rounded-t-none md:rounded-l-full'}`}>
                <div className="flex items-center gap-2">
                  <MapPin size={18} className={`${errors.location ? 'text-red-400' : 'text-gray-400 group-hover:text-white'} transition-colors ml-2 md:ml-4`} />
                  <div className="flex flex-col flex-1">
                    <span className={`text-[10px] font-bold uppercase tracking-widest ${errors.location ? 'text-red-400' : 'text-gray-400'} pl-1`}>Ubicación</span>
                    <input
                      type="text"
                      placeholder={errors.location ? "no se encontró resultados" : "¿A dónde vas?"}
                      value={errors.location ? "" : formData.location}
                      onChange={(e) => {
                        setFormData({ ...formData, location: e.target.value });
                        if (errors.location) setErrors({ ...errors, location: false });
                      }}
                      className={`bg-transparent border-none outline-none text-sm font-bold w-full ${errors.location ? 'placeholder:text-red-400 text-red-400' : 'text-white placeholder:text-gray-300'}`}
                    />
                  </div>
                </div>
              </div>

              <div className={`w-full md:w-auto flex-1 p-2 md:p-3 flex flex-col justify-center border-b md:border-b-0 md:border-r border-white/10 group cursor-pointer transition-colors relative ${errors.propertyType ? 'bg-red-500/20' : 'hover:bg-white/5'}`}>
                <div className="flex items-center gap-2">
                  <Home size={18} className={`${errors.propertyType ? 'text-red-400' : 'text-gray-400 group-hover:text-white'} transition-colors ml-2 md:ml-4`} />
                  <div className="flex flex-col flex-1 w-full relative">
                    <span className={`text-[10px] font-bold uppercase tracking-widest pl-1 ${errors.propertyType ? 'text-red-400' : 'text-gray-400'}`}>Tipo de propiedad</span>
                    <div className="relative w-full">
                      <select
                        value={formData.propertyType}
                        onChange={(e) => {
                          setFormData({ ...formData, propertyType: e.target.value });
                          if (errors.propertyType) setErrors({ ...errors, propertyType: false });
                        }}
                        className={`appearance-none bg-transparent border-none outline-none text-sm font-bold w-full cursor-pointer pr-8 ${errors.propertyType ? 'text-red-400' : (formData.propertyType === '' ? 'text-gray-300' : 'text-white')}`}
                        style={{ colorScheme: 'dark' }}
                      >
                        <option value="" disabled hidden className="text-gray-400 bg-minimal-dark">{errors.propertyType ? "no se encontró" : "Elegir"}</option>
                        <option value="Apartamento" className="text-white bg-minimal-dark">Apartamento</option>
                        <option value="Habitación" className="text-white bg-minimal-dark">Habitación</option>
                        <option value="Estudio" className="text-white bg-minimal-dark">Estudio</option>
                      </select>
                      <ChevronDown size={14} className={`${errors.propertyType ? 'text-red-400' : 'text-gray-400'} absolute right-0 top-1/2 -translate-y-1/2 pointer-events-none`} />
                    </div>
                  </div>
                </div>
              </div>


              <div className="w-full md:w-auto flex-1 p-2 md:p-3 flex flex-col justify-center group cursor-pointer hover:bg-white/5 transition-colors rounded-b-[2.5rem] md:rounded-b-none md:rounded-r-full">
                <div className="flex items-center gap-2 pr-4 md:pr-6">
                  <div className="w-4 h-4 flex-shrink-0 ml-2 md:ml-4" />
                  <div className="flex flex-col flex-1 overflow-hidden">
                    <span className="text-[10px] font-bold uppercase tracking-widest text-gray-400 truncate pl-1">Fecha de entrada</span>
                    <input
                      type="date"
                      value={formData.date}
                      onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                      min={getTodayDate()}
                      className="bg-transparent border-none outline-none text-sm font-bold text-white w-full cursor-pointer placeholder:text-gray-300"
                      style={{ colorScheme: 'dark' }}
                    />
                  </div>

                  <button
                    onClick={handleSearch}
                    className="bg-minimal-olive text-white w-12 h-12 md:w-14 md:h-14 rounded-full flex items-center justify-center hover:bg-minimal-olive/90 hover:scale-105 transition-all active:scale-95 shadow-lg flex-shrink-0 ml-4 border border-minimal-olive"
                  >
                    <Search size={24} />
                  </button>
                </div>
              </div>

            </div>
          </div>
        </div>


        <div className="w-full flex flex-col md:flex-row justify-between items-end mb-[-6rem]">
          <div className="w-full px-0 pb-4 md:pb-8">
            <h1 className="text-4xl md:text-5xl lg:text-7xl font-bold text-white mb-2 md:mb-4 drop-shadow-2xl tracking-tighter leading-tight md:whitespace-nowrap min-h-[1.2em]">
              {typedTitle}
              {!typingDone && <span className="inline-block w-[3px] h-[0.8em] bg-white ml-1 align-middle animate-pulse" />}
            </h1>
            <p className="text-lg md:text-xl lg:text-2xl text-white/90 font-medium drop-shadow-md">
              "Tu próximo capítulo empieza en un espacio a tu medida"
            </p>
          </div>

          <div className="mt-8 md:mt-0 px-4 md:px-0 flex flex-col items-start md:items-end gap-1 text-white/90 drop-shadow-md pb-2">
            <div className="flex items-center gap-2">
              <span className="text-xs font-semibold uppercase tracking-wider text-white/80">Excelente</span>
              <div className="flex text-minimal-gold scale-90">
                {"★★★★★".split('').map((star, i) => <span key={i}>{star}</span>)}
              </div>
              <span className="text-sm font-bold ml-1">4.8/5</span>
            </div>
            <span className="text-xs font-medium text-white/60">en Google Maps</span>
          </div>
        </div>

      </div>
    </section>
  );
};

export default Hero;
