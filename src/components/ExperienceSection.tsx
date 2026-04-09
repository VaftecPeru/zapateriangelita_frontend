import { useRef } from 'react';
import { Eye, ArrowRight, ChevronLeft, ChevronRight } from 'lucide-react';

const ExperienceSection = ({ properties, onOpenProperty }: { properties: any[], onOpenProperty: (p: any) => void }) => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    const experienceRooms = properties.slice(0, 6);

    return (
        <section className="bg-minimal-beige py-24 px-6 relative overflow-hidden text-center md:text-left">
            <div className="max-w-7xl mx-auto">
                <div className="flex flex-col md:flex-row justify-between items-center md:items-end mb-16 gap-6">
                    <div className="max-w-3xl">
                        <h2 className="text-4xl md:text-6xl font-black text-black tracking-tighter mb-6 leading-[0.9]">
                            ¿Quieres sentir lo que es pertenecer? <span className="text-[#164E63]">¡Mira esto!</span>
                        </h2>
                        <p className="text-lg text-gray-500 font-medium">
                            Nuestros espacios, eventos y comunidad te esperan para que empieces un nuevo capítulo.
                        </p>
                    </div>
                </div>

                <div className="relative group/gallery">
                    <div className="hidden md:flex absolute inset-y-0 -left-12 lg:-left-20 items-center z-10">
                        <button
                            onClick={() => scroll('left')}
                            className="text-black/40 hover:text-black hover:scale-110 transition-all transform py-20"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={60} strokeWidth={1} />
                        </button>
                    </div>

                    <div className="hidden md:flex absolute inset-y-0 -right-12 lg:-right-20 items-center z-10">
                        <button
                            onClick={() => scroll('right')}
                            className="text-black/40 hover:text-black hover:scale-110 transition-all transform py-20"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={60} strokeWidth={1} />
                        </button>
                    </div>

                    <div 
                        ref={scrollRef}
                        className="flex gap-4 md:gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory pb-12 -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth"
                    >
                        {experienceRooms.length > 0 ? (
                            experienceRooms.map((p, idx) => (
                                <div 
                                    key={p.id || idx}
                                    onClick={() => onOpenProperty(p)}
                                    className="min-w-[280px] md:min-w-[320px] aspect-[9/16] relative rounded-[2.5rem] overflow-hidden group cursor-pointer snap-center shadow-xl shadow-black/10 hover:shadow-2xl transition-all duration-500"
                                >
                                    <img 
                                        src={p.img || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800'} 
                                        alt={p.title}
                                        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                    />
                                    
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />

                                    <div className="absolute inset-0 flex items-center justify-center">
                                        <div className="w-14 h-14 md:w-16 md:h-16 bg-minimal-olive text-white rounded-full flex items-center justify-center shadow-2xl scale-0 group-hover:scale-100 transition-all duration-500 delay-100 hover:scale-110 active:scale-95">
                                            <Eye size={24} className="md:size-28" />
                                        </div>
                                    </div>

                                    <div className="absolute bottom-8 left-8 right-8 text-white translate-y-4 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-500">
                                        <h4 className="font-black text-lg tracking-tight mb-1">{p.title}</h4>
                                        <p className="text-xs font-bold uppercase tracking-widest text-white/70">{p.location}</p>
                                    </div>
                                </div>
                            ))
                        ) : (
                            [...Array(6)].map((_, i) => (
                                <div key={i} className="min-w-[280px] aspect-[9/16] bg-gray-200 rounded-[2.5rem] animate-pulse snap-center" />
                            ))
                        )}
                    </div>
                </div>

                <div className="flex justify-center mt-6">
                    <a href="#reservar">
                        <button className="bg-black text-white px-10 py-5 rounded-2xl font-black text-xs uppercase tracking-[0.2em] flex items-center gap-3 hover:bg-minimal-olive transition-all shadow-2xl active:scale-95 group">
                            Solicita ahora
                            <ArrowRight size={18} className="group-hover:translate-x-1 transition-transform" />
                        </button>
                    </a>
                </div>
            </div>
        </section>
    );
};

export default ExperienceSection;
