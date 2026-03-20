import { useRef } from 'react';
import { ShieldCheck, Clock, Headphones, Zap, Star, Home, ChevronLeft, ChevronRight } from 'lucide-react';

const features = [
    {
        icon: <ShieldCheck size={24} />,
        title: "Seguro y Confiable",
        desc: "Todas nuestras propiedades están verificadas y cumplen con estándares de calidad."
    },
    {
        icon: <Clock size={24} />,
        title: "Disponibilidad 24/7",
        desc: "Atención al cliente disponible en todo momento para resolver tus dudas."
    },
    {
        icon: <Headphones size={24} />,
        title: "Soporte Personalizado",
        desc: "Equipo dedicado para ayudarte a encontrar el espacio perfecto para ti."
    },
    {
        icon: <Zap size={24} />,
        title: "Proceso Simple",
        desc: "Reserva fácil y rápida con confirmación inmediata de tu apartamento."
    },
    {
        icon: <Star size={24} />,
        title: "Calidad Garantizada",
        desc: "Propiedades seleccionadas cuidadosamente para tu comodidad y satisfacción."
    },
    {
        icon: <Home size={24} />,
        title: "Totalmente Amoblado",
        desc: "Todos los espacios vienen completamente equipados y listos para habitar."
    }
];

const WhyChooseUs = () => {
    const scrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right') => {
        if (scrollRef.current) {
            const { scrollLeft, clientWidth } = scrollRef.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            scrollRef.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section className="py-16 px-6 bg-orie-cream relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div className="max-w-2xl">
                        <h2 className="umbralsuites-h2 mb-4">¿Por qué elegir Umbral Suites?</h2>
                        <p className="umbralsuites-p-muted text-base">
                            Ofrecemos la mejor experiencia en búsqueda y reserva de apartamentos y habitaciones amobladas
                        </p>
                    </div>

                    {/* Navigation Arrows */}
                    <div className="flex gap-2 mb-2">
                        <button
                            onClick={() => scroll('left')}
                            className="p-3 bg-white border border-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            aria-label="Anterior"
                        >
                            <ChevronLeft size={20} />
                        </button>
                        <button
                            onClick={() => scroll('right')}
                            className="p-3 bg-white border border-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            aria-label="Siguiente"
                        >
                            <ChevronRight size={20} />
                        </button>
                    </div>
                </div>

                <div
                    ref={scrollRef}
                    className="flex overflow-x-auto gap-6 no-scrollbar snap-x snap-mandatory pb-4"
                >
                    {features.map((f, idx) => (
                        <div
                            key={idx}
                            className="min-w-[85vw] md:min-w-[calc(33.333%-16px)] bg-minimal-cinnamon/[0.15] text-black rounded-2xl p-8 flex flex-col items-start border border-black hover:bg-minimal-cinnamon/[0.2] transition-all snap-center"
                        >
                            <div className="mb-6 text-minimal-cinnamon bg-minimal-cinnamon/10 p-3 rounded-xl border border-minimal-cinnamon/20">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold mb-2">{f.title}</h3>
                            <p className="text-black/60 text-sm">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
