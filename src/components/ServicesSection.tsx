import { useRef } from 'react';
import { Wifi, Sparkles, Car, Utensils, Dumbbell, Box, ChevronLeft, ChevronRight, Search, Home, Smartphone } from 'lucide-react';

const ziroomServices = [
    {
        title: "Limpieza",
        description: "Abraza la frescura y regresa a la libertad.",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
        bg: "bg-yellow-50",
        accent: "text-yellow-600"
    },
    {
        title: "Mover lugar",
        description: "Empaquetar y transportar recuerdos es ideal.",
        image: "https://images.unsplash.com/photo-1600585152220-90363fe7e115?auto=format&fit=crop&q=80&w=800",
        bg: "bg-blue-50",
        accent: "text-blue-600"
    },
    {
        title: "Reparación de viviendas",
        description: "Protección de seguridad oportuna y profesional.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800",
        bg: "bg-indigo-50",
        accent: "text-indigo-600"
    },
    {
        title: "Proyectos de renta",
        description: "Optimiza tu espacio para el mejor rendimiento.",
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
        bg: "bg-emerald-50",
        accent: "text-emerald-600"
    }
];

const additionalServices = [
    {
        title: "Internet de Alta Velocidad",
        desc: "Conexión fibra óptica hasta 500 Mbps incluida en todas las propiedades",
        price: "Incluido",
        icon: <Wifi size={24} />,
        popular: true
    },
    {
        title: "Servicio de Limpieza",
        desc: "Limpieza profesional semanal o quincenal de tu espacio",
        price: "Desde $50/mes",
        icon: <Sparkles size={24} />,
        popular: true
    },
    {
        title: "Estacionamiento Privado",
        desc: "Espacio de parking cubierto y seguro para tu vehículo",
        price: "$80/mes",
        icon: <Car size={24} />,
        popular: false
    },
    {
        title: "Servicio de Comidas",
        desc: "Desayuno, almuerzo o cena preparados por chef profesional",
        price: "Desde $200/mes",
        icon: <Utensils size={24} />,
        popular: false
    },
    {
        title: "Gimnasio y Spa",
        desc: "Acceso completo a gimnasio equipado y área de wellness",
        price: "$45/mes",
        icon: <Dumbbell size={24} />,
        popular: true
    },
    {
        title: "Recepción de Paquetes",
        desc: "Servicio de conserjería para recibir y guardar tus entregas",
        price: "Incluido",
        icon: <Box size={24} />,
        popular: false
    }
];

const ServicesSection = () => {
    const ziroomScrollRef = useRef<HTMLDivElement>(null);
    const additionalScrollRef = useRef<HTMLDivElement>(null);

    const scroll = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section id="servicios" className="py-24 px-6 bg-white selection:bg-black selection:text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
                {/* Ziroom Services Grid - FIRST */}
                <div className="mb-24 relative">
                    <div className="flex flex-col md:flex-row justify-between items-start md:items-end mb-12 gap-6">
                        <div className="max-w-2xl">
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-minimal-olive/10 text-minimal-olive rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-6">
                                Servicio Ziroom
                            </div>
                            <h2 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-tight mb-4">
                                Servicios Ziroom
                            </h2>
                            <p className="text-lg text-gray-400 font-medium italic">
                                Para vivir una buena vida no es necesario mover un dedo.
                            </p>
                        </div>

                        {/* Navigation Arrows for Ziroom */}
                        <div className="flex gap-2 mb-2 md:mb-0">
                            <button
                                onClick={() => scroll('left', ziroomScrollRef)}
                                className="p-3 bg-white border border-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll('right', ziroomScrollRef)}
                                className="p-3 bg-white border border-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={ziroomScrollRef}
                        className="flex overflow-x-auto gap-6 xl:gap-8 no-scrollbar snap-x snap-mandatory pb-4"
                    >
                        {ziroomServices.map((service, idx) => (
                            <div key={idx} className={`min-w-[85vw] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] ${service.bg} rounded-[2rem] overflow-hidden border border-black/5 hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group flex flex-col snap-center select-none`}>
                                <div className="p-8 pb-6 flex-grow">
                                    <h3 className={`text-2xl font-black mb-3 ${service.accent}`}>{service.title}</h3>
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed">{service.description}</p>
                                </div>
                                <div className="h-48 sm:h-56 relative overflow-hidden mt-auto">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700"
                                    />
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent"></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Growth Stats Mini */}
                <div className="mb-32 grid grid-cols-2 lg:grid-cols-4 gap-8 py-12 border-y border-gray-100">
                    {[
                        { label: "Personal", val: "9000+", icon: <Sparkles size={16} className="text-yellow-500" /> },
                        { label: "Afiliados", val: "1.5M+", icon: <Smartphone size={16} className="text-blue-500" /> },
                        { label: "Pedidos", val: "10M+", icon: <Search size={16} className="text-orange-500" /> },
                        { label: "Ciudades", val: "10+", icon: <Home size={16} className="text-indigo-500" /> }
                    ].map((s, i) => (
                        <div key={i} className="flex items-center gap-4">
                            <div className="w-10 h-10 bg-gray-50 rounded-xl flex items-center justify-center">{s.icon}</div>
                            <div>
                                <p className="text-lg font-black text-black leading-none">{s.val}</p>
                                <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{s.label}</p>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Additional Services Carousel - RESTORED STYLE */}
                <div className="relative">
                    <div className="flex justify-between items-end mb-12">
                        <div className="max-w-2xl">
                            <h2 className="homad-h2 mb-4">Servicios Adicionales</h2>
                            <p className="homad-p-muted text-base">
                                Mejora tu experiencia con nuestros servicios premium diseñados para tu comodidad
                            </p>
                        </div>

                        {/* Navigation Arrows */}
                        <div className="flex gap-2 mb-2">
                            <button
                                onClick={() => scroll('left', additionalScrollRef)}
                                className="p-3 bg-white border border-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ChevronLeft size={20} />
                            </button>
                            <button
                                onClick={() => scroll('right', additionalScrollRef)}
                                className="p-3 bg-white border border-black rounded-xl hover:bg-gray-50 transition-colors shadow-sm"
                            >
                                <ChevronRight size={20} />
                            </button>
                        </div>
                    </div>

                    <div
                        ref={additionalScrollRef}
                        className="flex overflow-x-auto gap-6 no-scrollbar snap-x snap-mandatory pb-4"
                    >
                        {additionalServices.map((s, idx) => (
                            <div
                                key={idx}
                                className="min-w-[85vw] md:min-w-[calc(33.333%-16px)] bg-minimal-olive/[0.15] rounded-2xl p-8 flex flex-col h-full border border-black hover:bg-minimal-olive/[0.2] transition-all snap-center"
                            >
                                <div className="flex justify-between items-start mb-6">
                                    <div className="mb-6 text-minimal-olive bg-minimal-olive/10 p-3 rounded-xl border border-minimal-olive/20">
                                        {s.icon}
                                    </div>
                                    {s.popular && (
                                        <span className="homad-badge bg-orie-red text-white py-1.5 rounded-lg tracking-widest text-center">
                                            Popular
                                        </span>
                                    )}
                                </div>

                                <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                                <p className="homad-p-muted mb-6 flex-grow text-sm">
                                    {s.desc}
                                </p>

                                <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                                    <span className="text-sm font-bold text-gray-900">{s.price}</span>
                                    <button className="text-sm font-black text-gray-900 hover:tracking-wider transition-all uppercase tracking-widest">
                                        Agregar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
