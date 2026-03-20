import { useRef, useEffect, useState } from 'react';
import { Wifi, Sparkles, Car, Utensils, Dumbbell, Box, ChevronLeft, ChevronRight, Search, Home, Smartphone, Star } from 'lucide-react';
import { additionalServiceService, AdditionalService, leadService } from '../services/crudService';
import { useSettings } from '../hooks/useSettings';

const umbralSuitesServices = [
    {
        title: "Limpieza",
        shortDesc: "Disfruta de frescura y regresa a la libertad.",
        description: "Disfruta de frescura y regresa a la libertad.",
        image: "https://images.unsplash.com/photo-1584622650111-993a426fbf0a?auto=format&fit=crop&q=80&w=800",
        bg: "bg-[#FFF9E6]",
        accent: "text-[#F4B400]",
        iconBg: "bg-[#F4B400]",
        icon: <Sparkles className="w-6 h-6 text-white" />
    },
    {
        title: "Mover lugar",
        shortDesc: "Empaquetamos y transportamos tus recursos.",
        description: "Empaquetamos y transportamos tus recursos.",
        image: "https://images.unsplash.com/photo-1628177142898-93e36e4e3a50?auto=format&fit=crop&q=80&w=800",
        bg: "bg-[#EBF3FF]",
        accent: "text-[#4285F4]",
        iconBg: "bg-[#4285F4]",
        icon: <Car className="w-6 h-6 text-white" />
    },
    {
        title: "Reparación de viviendas",
        shortDesc: "Solución profesional a daños y averías.",
        description: "Solución profesional a daños y averías.",
        image: "https://images.unsplash.com/photo-1581094794329-c8112a89af12?auto=format&fit=crop&q=80&w=800",
        bg: "bg-[#F3E8FF]",
        accent: "text-[#7B1FA2]",
        iconBg: "bg-[#7B1FA2]",
        icon: <Box className="w-6 h-6 text-white" />
    },
    {
        title: "Proyectos de renta",
        shortDesc: "Optimiza tu espacio para el mejor rendimiento.",
        description: "Optimiza tu espacio para el mejor rendimiento.",
        image: "https://images.unsplash.com/photo-1484154218962-a197022b5858?auto=format&fit=crop&q=80&w=800",
        bg: "bg-[#E6FFFA]",
        accent: "text-[#00897B]",
        iconBg: "bg-[#00897B]",
        icon: <Home className="w-6 h-6 text-white" />
    }
];



const ServicesSection = () => {
    const umbralSuitesScrollRef = useRef<HTMLDivElement>(null);
    const additionalScrollRef = useRef<HTMLDivElement>(null);
    const [dynamicServices, setDynamicServices] = useState<AdditionalService[]>([]);
    const { settings } = useSettings();
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const servicesRes = await additionalServiceService.getAll();
                setDynamicServices(servicesRes.data);
            } catch (err) {
                console.error("Error fetching services:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, []);


    const getServiceIcon = (name: string, _index: number) => {
        const lowercaseName = name.toLowerCase();
        if (lowercaseName.includes('wifi') || lowercaseName.includes('internet')) return <Wifi size={24} />;
        if (lowercaseName.includes('limpieza')) return <Sparkles size={24} />;
        if (lowercaseName.includes('parking') || lowercaseName.includes('estacionamiento')) return <Car size={24} />;
        if (lowercaseName.includes('comida') || lowercaseName.includes('chef')) return <Utensils size={24} />;
        if (lowercaseName.includes('gym') || lowercaseName.includes('gimnasio')) return <Dumbbell size={24} />;
        if (lowercaseName.includes('paquete') || lowercaseName.includes('recepción')) return <Box size={24} />;
        return <Star size={24} />;
    };

    const handleWhatsAppRequest = (serviceName?: string, price?: number, serviceId?: number) => {
        if (serviceId) {
            leadService.trackLead('service', serviceId).catch(console.error);
        }
        
        const phoneNumber = settings.whatsapp_number;
        
        if (!phoneNumber) {
            alert("El número de contacto no está configurado.");
            return;
        }

        let message = "Hola, buen día. Me interesa obtener información sobre los servicios de Umbral Suites.";
        
        if (serviceName) {
            message = `Hola, buen día. Me interesa solicitar el servicio de "${serviceName}" de Umbral Suites.${price ? ` (Precio: S/${price})` : ''} ¿Podrían brindarme más información sobre disponibilidad y proceso de contratación?`;
        }

        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    const scroll = (direction: 'left' | 'right', ref: React.RefObject<HTMLDivElement>) => {
        if (ref.current) {
            const { scrollLeft, clientWidth } = ref.current;
            const scrollTo = direction === 'left' ? scrollLeft - clientWidth : scrollLeft + clientWidth;
            ref.current.scrollTo({ left: scrollTo, behavior: 'smooth' });
        }
    };

    return (
        <section id="servicios" className="py-24 px-6 bg-minimal-beige selection:bg-black selection:text-white relative overflow-hidden">
            <div className="max-w-7xl mx-auto">
          
                <div className="mb-6 relative">
                    <div className="text-center mb-8 px-4">
                        <h2 className="umbralsuites-h2 text-5xl md:text-6xl mb-4">
                            Servicios Umbral Suites
                        </h2>
                        <p className="text-xl text-gray-800 font-medium mb-8 max-w-3xl mx-auto">
                            Contrata limpieza, mudanza y mantenimiento en minutos
                        </p>
                        <div className="flex justify-center">
                            <button 
                                onClick={() => handleWhatsAppRequest()}
                                className="bg-[#6b8552] text-white px-10 py-4 rounded-xl text-2xl font-bold shadow-lg hover:bg-minimal-olive transition-all active:scale-95"
                            >
                                Solicitar servicio
                            </button>
                        </div>
                    </div>

                    <div className="flex justify-end gap-3 mb-6 px-4">
                        <button
                            onClick={() => scroll('left', umbralSuitesScrollRef)}
                            className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm text-gray-400"
                        >
                            <ChevronLeft size={24} />
                        </button>
                        <button
                            onClick={() => scroll('right', umbralSuitesScrollRef)}
                            className="p-3 bg-white border border-gray-200 rounded-2xl hover:bg-gray-50 transition-colors shadow-sm text-gray-400"
                        >
                            <ChevronRight size={24} />
                        </button>
                    </div>

                    <div
                        ref={umbralSuitesScrollRef}
                        className="flex overflow-x-auto gap-6 xl:gap-8 no-scrollbar snap-x snap-mandatory pb-4 px-4"
                    >
                        {umbralSuitesServices.map((service, idx) => (
                            <div key={idx} className="min-w-[85vw] sm:min-w-[calc(50%-12px)] lg:min-w-[calc(25%-18px)] bg-white rounded-[2.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group flex flex-col snap-center select-none">
                                <div className={`px-8 py-6 ${service.bg}`}>
                                    <div className="flex items-center gap-4">
                                        <div className={`w-12 h-12 rounded-full ${service.iconBg} flex items-center justify-center shadow-lg border border-white/20`}>
                                            {service.icon}
                                        </div>
                                        <h3 className={`text-xl font-black ${service.accent} leading-tight max-w-[150px]`}>{service.title}</h3>
                                    </div>
                                </div>
                                
                                <div className="h-48 sm:h-52 relative overflow-hidden">
                                    <img
                                        src={service.image}
                                        alt={service.title}
                                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                    />
                                </div>

                                <div className="px-8 py-7 bg-white flex-grow flex flex-col">
                                    <p className="text-sm text-gray-500 font-medium leading-relaxed mb-6">
                                        {service.description}
                                    </p>
                                    <button 
                                        onClick={() => handleWhatsAppRequest(service.title)}
                                        className={`mt-auto w-fit text-sm font-black uppercase tracking-widest pb-1 border-b-2 border-transparent hover:border-current transition-all ${service.accent}`}
                                    >
                                        Solicitar
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

              
                <div className="mb-12 bg-white rounded-3xl shadow-[0_10px_50px_rgba(0,0,0,0.04)] border border-gray-100 py-6 px-8">
                    <div className="grid grid-cols-2 lg:grid-cols-4 gap-8">
                        {[
                            { label: "Profesionales activos", val: "9,000+", accent: "bg-yellow-50 text-yellow-500", icon: <Sparkles size={20} /> },
                            { label: "Aplicaciones descargadas", val: "1.5M+", accent: "bg-blue-50 text-blue-500", icon: <Smartphone size={20} /> },
                            { label: "Servicios completados", val: "10M+", accent: "bg-orange-50 text-orange-500", icon: <Search size={20} /> },
                            { label: "Ciudades cubiertas", val: "10+", accent: "bg-emerald-50 text-emerald-500", icon: <Home size={20} /> }
                        ].map((s, i) => (
                            <div key={i} className="flex items-center gap-6 group">
                                <div className={`w-14 h-14 ${s.accent} rounded-2xl flex items-center justify-center transition-transform group-hover:scale-110`}>
                                    {s.icon}
                                </div>
                                <div>
                                    <p className="text-2xl font-black text-gray-900 leading-none mb-2">{s.val}</p>
                                    <p className="text-sm font-medium text-gray-400 capitalize">{s.label}</p>
                                </div>
                                {i < 3 && <div className="hidden lg:block w-px h-12 bg-gray-100 ml-auto mr-0"></div>}
                            </div>
                        ))}
                    </div>
                </div>

           
                <div className="relative mt-24 pt-20 border-t border-black/5">
                    <div className="flex justify-between items-end mb-12">
                        <div className="max-w-2xl">
                            <h2 className="umbralsuites-h2 mb-4">Servicios Adicionales</h2>
                            <p className="umbralsuites-p-muted text-base">
                                Mejora tu experiencia con nuestros servicios premium diseñados para tu comodidad
                            </p>
                        </div>

                        
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
                        {loading ? (
                            <div className="w-full py-20 text-center">
                                <p className="text-gray-400 font-bold uppercase tracking-widest text-xs">Cargando servicios adicionales...</p>
                            </div>
                        ) : dynamicServices.length > 0 ? (
                            dynamicServices.map((s, idx) => (
                                <div
                                    key={s.id || idx}
                                    className="min-w-[85vw] md:min-w-[calc(33.333%-16px)] bg-minimal-olive/[0.15] rounded-2xl p-8 flex flex-col h-full border border-black hover:bg-minimal-olive/[0.2] transition-all snap-center"
                                >
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="mb-6 text-minimal-olive bg-minimal-olive/10 p-3 rounded-xl border border-minimal-olive/20">
                                            {getServiceIcon(s.name, idx)}
                                        </div>
                                        {idx < 2 && (
                                            <span className="umbralsuites-badge bg-orie-red text-white py-1.5 rounded-lg tracking-widest text-center">
                                                Popular
                                            </span>
                                        )}
                                    </div>

                                    <h3 className="text-lg font-bold text-gray-900 mb-2">{s.name}</h3>
                                    <p className="umbralsuites-p-muted mb-6 flex-grow text-sm">
                                        {s.description || "Mejora tu estancia con este servicio exclusivo diseñado para tu confort."}
                                    </p>

                                        <div className="flex justify-between items-center pt-6 border-t border-gray-100 gap-4">
                                            <span className="text-sm font-bold text-gray-900">S/{s.price}</span>
                                            <button 
                                                onClick={() => handleWhatsAppRequest(s.name, s.price, s.id)}
                                                className="text-sm font-black text-gray-900 hover:tracking-wider transition-all uppercase tracking-widest bg-white border border-black px-4 py-2 rounded-lg"
                                            >
                                            Solicitar
                                        </button>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="w-full py-20 text-center">
                                <p className="text-gray-400 font-bold">No hay servicios adicionales disponibles en este momento.</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </section>
    );
};

export default ServicesSection;
