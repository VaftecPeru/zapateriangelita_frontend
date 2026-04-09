import { useRef } from 'react';
import { Star, MapPin, Facebook, ShieldCheck, ChevronLeft, ChevronRight } from 'lucide-react';
import comentario1 from '../assets/comentario1.jpg';
import comentario2 from '../assets/comentario2.jpg';
import comentario3 from '../assets/comentario3.jpg';
import comentario4 from '../assets/comentario4.jpg';
import comentario5 from '../assets/comentario5.jpg';

const testimonials = [
  {
    name: 'Alessandra M.',
    image: comentario1,
    text: 'Llevo unos meses viviendo en una propiedad de UmbralSuites y agradezco mucho la flexibilidad y la facilidad para reservar. El equipo de alquiler es muy atento y fácil de tratar. Para mi situación temporal, UmbralSuites ha sido una bendición y todos los inquilinos que he conocido son encantadores. ¡Saludos!'
  },
  {
    name: 'Ella L.',
    image: comentario2,
    text: 'Llevo alquilando con UmbralSuites desde agosto, ¡y ha sido una experiencia fantástica! Son muy fáciles de tratar: flexibles y atentos en todo momento. Su servicio de atención al cliente es impecable, con respuestas automáticas y puntuales que facilitan la comunicación.'
  },
  {
    name: 'Roberto G.',
    image: comentario3,
    text: 'Como profesional que viaja constantemente, encontrar un espacio que combine lujo y funcionalidad era mi prioridad. UmbralSuites no solo me ofreció un departamento impecable, sino una comunidad de networking increíble. El proceso de reserva fue tan fluido como en un hotel de 5 estrellas, pero con la calidez de un hogar verdadero.'
  },
  {
    name: 'Valentina S.',
    image: comentario4,
    text: 'El concepto de coliving de UmbralSuites ha cambiado mi forma de ver el alquiler en Lima. La limpieza semanal y el internet de alta velocidad me permiten trabajar desde casa sin preocupaciones. Es el equilibrio perfecto entre privacidad en mi habitación y áreas sociales vibrantes donde siempre hay alguien interesante con quien conversar.'
  },
  {
    name: 'Marco T.',
    image: comentario5,
    text: 'Buscaba algo temporal para mi maestría y terminé renovando por un año más. La ubicación es inmejorable y el diseño de los espacios es digno de revista. Lo que más valoro es la seguridad y el soporte 24/7; cualquier pequeño detalle técnico se resuelve en horas. Es, sin duda, la mejor opción premium en la ciudad.'
  }
];

const ConfidenceSection = () => {
  const scrollRef = useRef<HTMLDivElement>(null);

  const scroll = (direction: 'left' | 'right') => {
    if (scrollRef.current) {
      const { scrollLeft, clientWidth } = scrollRef.current;
      const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
      scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
    }
  };

  return (
    <section className="bg-minimal-beige py-20 px-6 relative overflow-hidden">
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-16 gap-6">
          <div className="max-w-3xl">
            <h2 className="text-3xl md:text-5xl font-black text-black tracking-tighter mb-4">
              Con la confianza de más de <span className="text-[#9BB7D4]">12.000</span> inquilinos.
            </h2>
            <p className="text-base md:text-lg text-gray-600 font-medium leading-relaxed">
              Viviendas de calidad, una comunidad auténtica y miles de reseñas positivas que lo demuestran.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap justify-center gap-3 mb-16">
          {[
            { icon: MapPin, color: 'text-blue-500', rating: '4.4', stars: 4, label: 'Google Maps' },
            { icon: Facebook, color: 'text-blue-700', rating: '4.6', stars: 5, label: 'Facebook' },
            { icon: ShieldCheck, color: 'text-emerald-500', rating: '4.0', stars: 4, label: 'Trustpilot' }
          ].map((badge, i) => (
            <div key={i} className="bg-white px-5 py-2.5 rounded-full flex items-center gap-3 shadow-sm border border-black/5 hover:scale-105 transition-transform cursor-pointer group">
              <badge.icon size={16} className={badge.color} />
              <div className="flex items-center gap-1">
                <span className="font-black text-xs">{badge.rating}</span>
                <div className="flex text-yellow-400">
                  {[...Array(5)].map((_, i) => <Star key={i} size={10} fill={i < badge.stars ? "currentColor" : "none"} />)}
                </div>
              </div>
              <span className="text-[9px] font-black uppercase text-gray-400 group-hover:text-black transition-colors">En {badge.label} ↗</span>
            </div>
          ))}
        </div>

        <div className="relative group/testimonials">
       
          <div className="hidden md:flex absolute inset-y-0 -left-12 lg:-left-20 items-center z-10">
            <button
              onClick={() => scroll('left')}
              className="text-black/40 hover:text-black hover:scale-110 transition-all transform py-10"
              aria-label="Anterior"
            >
              <ChevronLeft size={60} strokeWidth={1} />
            </button>
          </div>

          <div className="hidden md:flex absolute inset-y-0 -right-12 lg:-right-20 items-center z-10">
            <button
              onClick={() => scroll('right')}
              className="text-black/40 hover:text-black hover:scale-110 transition-all transform py-10"
              aria-label="Siguiente"
            >
              <ChevronRight size={60} strokeWidth={1} />
            </button>
          </div>

          <div 
            ref={scrollRef}
            className="flex gap-8 overflow-x-auto no-scrollbar snap-x snap-mandatory mb-12 -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth pb-8"
          >
          {testimonials.map((t, idx) => (
            <div 
              key={idx} 
              className="min-w-[85%] md:min-w-[45%] lg:min-w-[400px] bg-[#A0A2A3] p-10 rounded-[2.5rem] shadow-xl shadow-black/[0.02] border border-white/10 flex flex-col snap-center hover:shadow-2xl hover:-translate-y-1 transition-all duration-300"
            >
              <div className="flex items-center gap-5 mb-8">
                <div className="w-16 h-16 rounded-full overflow-hidden border-2 border-white/30 shrink-0 shadow-lg">
                  <img src={t.image} alt={t.name} className="w-full h-full object-cover" />
                </div>
                <div>
                  <h4 className="font-black text-lg text-white tracking-tight">{t.name}</h4>
                  <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => <Star key={i} size={14} fill="currentColor" />)}
                  </div>
                </div>
              </div>
              <p className="text-base md:text-lg text-white font-medium leading-relaxed italic opacity-95">
                "{t.text}"
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  </section>
  );
};

export default ConfidenceSection;
