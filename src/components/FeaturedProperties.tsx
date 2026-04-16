import { useState, useEffect, useRef } from 'react';
import { Star, MapPin, Bed, Bath, Square, Heart, ChevronLeft, ChevronRight } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import { Link } from 'react-router-dom';

const FeaturedProperties = ({ searchCriteria, onOpenDetails, properties: initialProperties = [] }: any) => {
  const [properties, setProperties] = useState<any[]>(initialProperties);
  const [loading, setLoading] = useState(false);
  const { favorites, toggleFavorite, isAuthenticated } = useAuth();

  useEffect(() => {
    if (initialProperties.length > 0) {
      setProperties(initialProperties);
      setLoading(false);
    } else {
        // Solo cargar si no se pasaron props (fallback)
        setLoading(true);
        apiClient.get('/properties')
          .then(res => {
            const data = Array.isArray(res.data) ? res.data : (res.data.data || []);
            setProperties(data);
            setLoading(false)
          })
          .catch(err => {
            console.error("Error fetching properties:", err);
            setLoading(false);
          });
    }
  }, [initialProperties]);

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
    <section id="departamentos" className="py-24 px-6 bg-minimal-beige relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-2xl">
            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter mb-4 leading-[0.9]">
              Propiedades <span className="text-[#164E63]">Destacadas</span>
            </h2>
            <p className="text-gray-500 font-medium">
              {filteredProperties.length === 0
                ? 'No se encontraron propiedades que coincidan con tu búsqueda.'
                : `Explora nuestras ${filteredProperties.length} mejores opciones disponibles ahora.`}
            </p>
          </div>
        </div>

        <div className="relative group/carousel">
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute -left-5 top-[40%] -translate-y-1/2 z-10 p-3 bg-white border border-gray-100 rounded-full shadow-lg text-gray-800 hover:bg-black hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronLeft size={24} />
          </button>

          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute -right-5 top-[40%] -translate-y-1/2 z-10 p-3 bg-white border border-gray-100 rounded-full shadow-lg text-gray-800 hover:bg-black hover:text-white transition-all opacity-0 group-hover/carousel:opacity-100"
          >
            <ChevronRight size={24} />
          </button>

          <div
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-10 px-4 -mx-4 md:px-2 md:mx-0"
          >
          {filteredProperties.map((p) => (
            <div
              key={p.id}
              onClick={() => onOpenDetails(p)}
              className="min-w-[80vw] md:min-w-0 md:w-[340px] flex flex-col group bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer snap-center"
            >
              <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                <img
                  src={p.img || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800'}
                  className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                  alt={p.title}
                  onError={(e: any) => {
                    e.target.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800';
                  }}
                />

                <div className="absolute top-3 left-3">
                  <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">
                    {p.type}
                  </span>
                </div>

                <div className="absolute top-3 right-3">
                  <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest text-white shadow-sm ${p.status === 'Disponible' ? 'bg-minimal-olive' : 'bg-gray-400'}`}>
                    {p.status}
                  </span>
                </div>

                <button
                  onClick={(e) => handleToggleFavorite(e, p)}
                  className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 cursor-pointer"
                >
                  <Heart
                    size={16}
                    className={`${p.id !== undefined && isFavorite(p.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'} transition-all`}
                  />
                </button>
              </div>

              <div className="pt-4 pb-2 pl-6 pr-4 flex flex-col flex-grow">
                <div className="flex justify-between items-start gap-2 mb-1">
                  <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 flex-1">
                    {p.title}
                  </h3>
                  <div className="flex items-center gap-0.5 shrink-0">
                    {[...Array(5)].map((_, i) => (
                      <Star 
                        key={i} 
                        size={12} 
                        className={`${i < Math.round(p.rating) ? 'text-[#FFC107] fill-[#FFC107]' : 'text-gray-200 fill-gray-200'}`} 
                      />
                    ))}
                    <span className="text-[10px] font-black text-black ml-1.5">{p.rating}</span>
                  </div>
                </div>

                <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-3">
                  <MapPin className="text-minimal-gold w-3 h-3 shrink-0" />
                  <span className="truncate">{p.location}</span>
                </div>

                <div className="flex items-center gap-4 text-gray-500 text-xs font-semibold mb-4 border-t border-gray-100 pt-3">
                  <span className="flex items-center gap-1"><Bed size={14} className="text-gray-400" /> {p.beds} hab.</span>
                  <span className="flex items-center gap-1"><Bath size={14} className="text-gray-400" /> {p.baths} baños</span>
                  <span className="flex items-center gap-1"><Square size={14} className="text-gray-400" /> {p.area}</span>
                </div>

                {/* Price */}
                <div className="flex items-center gap-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-xs text-gray-400 font-semibold">desde</span>
                    {p.discounted_price && Number(p.discounted_price) > 0 ? (
                      <div className="flex items-center gap-1.5">
                        <span className="text-sm text-gray-400 font-semibold line-through">S/{Number(p.price).toFixed(2)}</span>
                        <span className="text-xl font-black text-gray-900">S/{Number(p.discounted_price).toFixed(2)}</span>
                      </div>
                    ) : (
                      <span className="text-xl font-black text-gray-900">S/{Number(p.price).toFixed(2)}</span>
                    )}
                    <span className="text-xs text-gray-400 font-semibold">/mes</span>
                  </div>
                  {p.discounted_price && Number(p.discounted_price) > 0 && (
                    <span className="text-xs font-black px-2.5 py-1 rounded-lg text-white bg-red-500 whitespace-nowrap shadow-sm">
                      -{(((p.price - Number(p.discounted_price)) / p.price) * 100).toFixed(0)}%
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
        </div>

        <div className="mt-20 flex justify-center">
          <Link
            to="/properties"
          >
            <button
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