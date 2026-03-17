import { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Bed, Bath, Square, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { Link } from 'react-router-dom';

const FeaturedProperties = ({ searchCriteria, onOpenDetails }: any) => {
  const [properties, setProperties] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const { favorites, toggleFavorite, isAuthenticated } = useAuth();

  useEffect(() => {
    apiClient.get('/properties')
      .then(res => {
        setProperties(res.data);
        setLoading(false)
      })
      .catch(err => {
        console.error("Error fetching properties:", err);
        setLoading(false);
      });
  }, []);

  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  const isFavorite = (id: number) => favorites.some(p => p.id === id);

  const handleToggleFavorite = (e: React.MouseEvent, p: any) => {
    e.stopPropagation();
    if (!isAuthenticated) return;
    toggleFavorite(p);
  };

  const filteredProperties = properties.filter(p => {
    if (!searchCriteria) return true;
    const matchesLocation = !searchCriteria.location || p.location.toLowerCase().includes(searchCriteria.location.toLowerCase());
    const matchesType = !searchCriteria.propertyType || p.type === searchCriteria.propertyType;
    return matchesLocation && matchesType;
  });

  if (loading) {
    return (
      <section className="py-24 px-6 bg-white text-center">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-100 rounded-full w-48 mx-auto" />
          <p className="homad-p-muted">Cargando propiedades...</p>
        </div>
      </section>
    );
  }

  return (
    <section id="apartamentos" className="py-24 px-6 bg-minimal-beige relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4 leading-[0.9]">
              Propiedades <span className="text-minimal-olive italic">Destacadas</span>
            </h2>
            <p className="text-gray-500 font-medium">
              {filteredProperties.length === 0
                ? 'No se encontraron propiedades que coincidan con tu búsqueda.'
                : `Explora nuestras ${filteredProperties.length} mejores opciones disponibles ahora.`}
            </p>
          </div>

          <div className="flex gap-3">
            <button
              onClick={() => scroll('left')}
              className="p-4 bg-white border border-black rounded-2xl hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <ChevronLeft size={20} />
            </button>
            <button
              onClick={() => scroll('right')}
              className="p-4 bg-white border border-black rounded-2xl hover:bg-black hover:text-white transition-all shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:translate-x-1 active:translate-y-1 active:shadow-none"
            >
              <ChevronRight size={20} />
            </button>
          </div>
        </div>

        <div
          ref={scrollRef}
          className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10 px-2"
        >
          {filteredProperties.map((p) => (
            <div
              key={p.id}
              onClick={() => onOpenDetails(p)}
              className="min-w-[85vw] md:min-w-[340px] group bg-white rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden border border-black hover:shadow-[10px_10px_0px_0px_rgba(255,145,77,0.25)] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 active:shadow-none transition-all duration-300 cursor-pointer p-1.5 md:p-2 snap-center"
            >
              <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] md:rounded-[1.2rem] shrink-0">
                <img
                  src={p.img}
                  className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                  alt={p.title}
                />

                <div className="absolute top-5 left-5">
                  <span className="bg-black/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.2em] border border-white/20">
                    {p.type}
                  </span>
                </div>

                <div className="absolute bottom-5 left-5">
                  <span className={`text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-widest text-white border border-black/10 backdrop-blur-xl ${p.status === 'Disponible' ? 'bg-minimal-olive' : 'bg-gray-400'}`}>
                    {p.status}
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleFavorite(e, p)}
                  className="absolute top-4 right-4 p-2 transition-all z-10 hover:scale-125 active:scale-75 cursor-pointer group/heart"
                >
                  <Heart
                    size={22}
                    className={`${isFavorite(p.id) ? 'text-red-500 fill-red-500' : 'text-white drop-shadow-md'} transition-all stroke-black stroke-[1.5px] group-active/heart:fill-red-400`}
                  />
                </button>
              </div>

              <div className="px-3 py-4 md:px-4 md:py-6">
                <div className="flex justify-between items-start mb-4 md:mb-6">
                  <div className="flex-1 min-w-0">
                    <h3 className="text-base md:text-xl font-black text-black leading-tight mb-1 md:mb-2 group-hover:text-[#FF914D] transition-colors line-clamp-2">
                      {p.title}
                    </h3>
                    <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                      <MapPin className="text-minimal-olive w-2.5 h-2.5 md:w-3 md:h-3" />
                      <span className="truncate">{p.location}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1 md:gap-1.5 bg-gray-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-black/5 shrink-0">
                    <Star className="text-minimal-olive fill-minimal-olive w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                    <span className="text-xs md:text-sm font-black text-black">{p.rating}</span>
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6">
                  <div className="bg-gray-50/50 py-3 rounded-xl border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-1.5 group-hover:bg-[#FF914D]/5 transition-colors">
                    <Bed className="text-minimal-olive w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[10px] md:text-xs font-black text-black">{p.beds}</span>
                  </div>
                  <div className="bg-gray-50/50 py-3 rounded-xl border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-1.5 group-hover:bg-minimal-olive/5 transition-colors">
                    <Bath className="text-minimal-olive w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[10px] md:text-xs font-black text-black">{p.baths}</span>
                  </div>
                  <div className="bg-gray-50/50 py-3 rounded-xl border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-1.5 group-hover:bg-minimal-olive/5 transition-colors">
                    <Square className="text-minimal-olive w-4 h-4 md:w-[18px] md:h-[18px]" />
                    <span className="text-[8px] md:text-[10px] font-black text-black uppercase">{p.area}</span>
                  </div>
                </div>

                <div className="flex justify-between items-center bg-black pl-4 pr-1.5 py-2.5 md:pl-5 md:pr-2 md:py-3 rounded-xl border border-black/5 group-hover:bg-[#FF914D] active:scale-[0.97] transition-all duration-300">
                  <div className="text-left">
                    <p className="text-[8px] md:text-[9px] text-white/40 font-black uppercase tracking-widest leading-none mb-0.5">Precio Total</p>
                    <p className="text-lg md:text-xl font-black text-white tracking-tighter leading-none">{p.price}</p>
                  </div>
                  <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center text-black">
                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>

        <div className="mt-20 flex justify-center">
          <Link
            to="/properties"
          >
            <button 
              // onClick={() => window.location.href = '/properties'}
              className="flex items-center gap-3 px-10 py-5 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-minimal-olive hover:scale-105 active:scale-95 transition-all shadow-2xl hover:shadow-minimal-olive/20 group"
            >
              Explorar propiedades
              <ChevronRight size={18} className="group-hover:translate-x-1 transition-transform" />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
};

export default FeaturedProperties;