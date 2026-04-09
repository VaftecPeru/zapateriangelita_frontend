import { useState, useEffect } from 'react';
import { ShieldCheck, ArrowRight, Star, Clock, Sparkles, ChevronLeft, ChevronRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import houseAsset from '../assets/freepik_departmanto.jpg';

const HowItWorksPage = () => {
    const [currentSlide, setCurrentSlide] = useState(0);

    const carouselImages = [
        "https://images.unsplash.com/photo-1598928506311-c55ded91a20c?auto=format&fit=crop&q=80&w=1200",
        "https://images.unsplash.com/photo-1586023492125-27b2c045efd7?auto=format&fit=crop&q=80&w=1200",
        houseAsset
    ];

    useEffect(() => {
        const timer = setInterval(() => {
            setCurrentSlide((prev: number) => (prev + 1) % carouselImages.length);
        }, 6000);
        return () => clearInterval(timer);
    }, [carouselImages.length]);

    const steps = [
        {
            number: "01",
            title: "Explora sin Límites",
            subtitle: "CURACIÓN Y VERIFICACIÓN",
            description: "Nuestra tecnología y equipo filtran miles de propiedades para que solo veas lo mejor. Cada rincón está documentado para tu tranquilidad.",
            features: [
                { label: "Verificación 360°", desc: "Fotos y vídeos reales de cada estancia." },
                { label: "Reserva Remota", desc: "Asegura tu hogar desde cualquier país." }
            ],
            image: houseAsset,
            accent: "text-minimal-olive",
            border: "border-minimal-olive/20",
            bg: "bg-minimal-olive/[0.03]"
        },
        {
            number: "02",
            title: "Seguridad Blindada",
            subtitle: "TRANSMISIÓN DE VALOR",
            description: "Eliminamos la incertidumbre. Tus pagos se mantienen en garantía hasta que confirmas que todo es tal como lo soñaste.",
            features: [
                { label: "Pago Protegido", desc: "Sistema de 'Escrow' para tu seguridad." },
                { label: "Contratos Digitales", desc: "Sin papeleo innecesario ni demoras." }
            ],
            image: "https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80&w=800",
            accent: "text-minimal-serene",
            border: "border-minimal-serene/20",
            bg: "bg-minimal-serene/[0.03]",
            reverse: true
        },
        {
            number: "03",
            title: "Bienvenida Umbral Suites",
            subtitle: "EXPERIENCIA POST-RESERVA",
            description: "No eres un número, eres parte de Umbral Suites. Te acompañamos en el check-in y durante toda tu estancia para lo que necesites.",
            features: [
                { label: "Soporte VIP", desc: "Atención prioritaria 24/7." },
                { label: "Garantía de Mudanza", desc: "Si no es lo prometido, te reubicamos." }
            ],
            image: "https://images.unsplash.com/photo-1527030280862-64139fba04ca?auto=format&fit=crop&q=80&w=800",
            accent: "text-minimal-cinnamon",
            border: "border-minimal-cinnamon/20",
            bg: "bg-minimal-cinnamon/[0.03]"
        }
    ];

    return (
        <div className="pt-24 min-h-screen bg-minimal-beige selection:bg-black selection:text-white overflow-hidden">
            <section className="py-12 md:py-20 px-6 relative">
                <div className="max-w-7xl mx-auto flex flex-col items-center">
                    <div className="inline-flex items-center gap-2 px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-[0.3em] mb-8 animate-fade-in shadow-xl">
                        ¿Cómo funciona Umbral Suites?
                    </div>

                    <h1 className="text-4xl md:text-7xl font-black tracking-tighter text-black text-center leading-[0.9] mb-12 animate-slide-up">
                        ¿CÓMO FUNCIONA?
                    </h1>

                    <div className="w-full relative group max-w-5xl">
                        <div className="aspect-[16/9] md:aspect-[21/8] w-full rounded-[2.5rem] overflow-hidden border border-black shadow-2xl relative bg-black/5">
                            {carouselImages.map((src, idx) => (
                                <div
                                    key={idx}
                                    className={`absolute inset-0 transition-opacity duration-1000 ease-in-out ${idx === currentSlide ? 'opacity-100 z-10' : 'opacity-0 z-0'}`}
                                >
                                    <img
                                        src={src}
                                        className={`w-full h-full object-cover ${idx === currentSlide ? 'animate-carousel-premium' : ''}`}
                                        alt={`Slide ${idx}`}
                                    />
                                    <div className="absolute inset-0 bg-black/10"></div>
                                </div>
                            ))}

                            <button
                                onClick={() => setCurrentSlide((prev: number) => (prev - 1 + carouselImages.length) % carouselImages.length)}
                                className="absolute left-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronLeft size={24} />
                            </button>
                            <button
                                onClick={() => setCurrentSlide((prev: number) => (prev + 1) % carouselImages.length)}
                                className="absolute right-6 top-1/2 -translate-y-1/2 w-12 h-12 bg-white/20 hover:bg-white/40 backdrop-blur-md rounded-full flex items-center justify-center text-white transition-all opacity-0 group-hover:opacity-100 z-20"
                            >
                                <ChevronRight size={24} />
                            </button>

                            {/* Indicators */}
                            <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
                                {carouselImages.map((_, idx) => (
                                    <button
                                        key={idx}
                                        onClick={() => setCurrentSlide(idx)}
                                        className={`w-2 h-2 rounded-full transition-all ${idx === currentSlide ? 'bg-white w-8 shadow-sm' : 'bg-white/40'}`}
                                    />
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* Narrative Section */}
            <section className="py-20 px-6">
                <div className="max-w-4xl mx-auto flex flex-col items-center text-center">
                    <h2 className="text-2xl md:text-4xl font-black text-black tracking-tighter leading-tight mb-6">
                        Redefiniendo el proceso de alquiler.
                    </h2>
                    <p className="text-lg text-black font-medium leading-relaxed max-w-2xl italic">
                        Sin complicaciones, sin sorpresas. Curamos cada paso para asegurar tu próximo hogar con total transparencia.
                    </p>
                </div>
            </section>

            <section className="py-20 px-6 space-y-40 md:space-y-64 pb-40">
                {steps.map((step, idx) => (
                    <div key={idx} className={`max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-12 md:gap-24 ${step.reverse ? 'lg:flex-row-reverse' : ''}`}>

                        <div className="flex-1 space-y-8 animate-fade-in">
                            <div className="space-y-4">
                                <div className="flex items-center gap-4">
                                    <span className={`text-6xl font-black ${step.accent} opacity-20 leading-none select-none tracking-tighter`}>{step.number}</span>
                                    <div className="h-[1px] flex-grow bg-black/5"></div>
                                </div>
                                <p className={`text-[9px] font-black uppercase tracking-[0.4em] ${step.accent}`}>{step.subtitle}</p>
                                <h3 className="text-4xl md:text-5xl font-black text-black tracking-tighter leading-none">
                                    {step.title}
                                </h3>
                            </div>

                            <p className="text-base text-black font-medium leading-relaxed max-w-md">
                                {step.description}
                            </p>

                            <div className="space-y-3">
                                {step.features.map((feat, fIdx) => (
                                    <div key={fIdx} className={`p-5 ${step.bg} border ${step.border} rounded-2xl shadow-sm hover:translate-y-[-2px] transition-all duration-300`}>
                                        <p className="text-sm font-black text-black mb-0.5">{feat.label}</p>
                                        <p className="text-xs text-black font-medium">{feat.desc}</p>
                                    </div>
                                ))}
                            </div>

                            {idx === 0 && (
                                <Link to="/" className="inline-flex items-center gap-4 group mt-4">
                                    <div className="w-12 h-12 bg-black rounded-full flex items-center justify-center text-white group-hover:scale-110 transition-transform duration-500 shadow-lg">
                                        <ArrowRight size={18} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest text-black border-b border-black/10 pb-0.5 group-hover:border-black transition-colors">
                                        Comienza tu búsqueda
                                    </span>
                                </Link>
                            )}
                        </div>

                        <div className="flex-[0.85] relative group max-w-md">
                            <div className="relative z-10 aspect-[4/5] md:aspect-square rounded-[2.5rem] overflow-hidden border border-black/10 shadow-xl transition-all duration-700">
                                <img
                                    src={step.image}
                                    alt={step.title}
                                    className="w-full h-full object-cover animate-paper-unfold"
                                    loading="lazy"
                                />
                            </div>
                            <div className={`absolute inset-0 ${step.bg} rounded-[3rem] -rotate-3 scale-105 -z-10 border border-black/5`}></div>
                        </div>

                    </div>
                ))}
            </section>

            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto bg-black rounded-[4rem] p-12 md:p-24 relative overflow-hidden shadow-3xl">
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-16 relative z-10">
                        {[
                            { icon: <Star size={24} />, title: "SIN FICCIÓN", desc: "Propiedades verificadas. Lo que ves es exactamente lo que recibirás." },
                            { icon: <Clock size={24} />, title: "SOPORTE HUMANO", desc: "Atención personalizada en cada etapa de tu nueva aventura." },
                            { icon: <ShieldCheck size={24} />, title: "SEGURIDAD TOTAL", desc: "Garantía de depósito y protección legal en cada contrato." }
                        ].map((item, i) => (
                            <div key={i} className="text-center md:text-left space-y-4">
                                <div className="w-12 h-12 bg-minimal-olive/10 text-minimal-gold rounded-2xl flex items-center justify-center font-black text-lg border border-minimal-olive/20">
                                    {item.icon}
                                </div>
                                <h4 className="text-xl font-black text-white tracking-tight">{item.title}</h4>
                                <p className="text-white/80 text-[13px] font-medium leading-relaxed">{item.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            <section className="py-32 px-6 text-center">
                <h2 className="text-4xl md:text-7xl font-black text-black tracking-tighter leading-none mb-10">
                    TU PRÓXIMO HOGAR <br />
                    EMPIEZA <span className="text-minimal-gold italic underline underline-offset-8">AQUÍ.</span>
                </h2>
                <div className="flex flex-col md:flex-row items-center justify-center gap-6">
                    <Link to="/register" className="umbralsuites-btn-primary px-10 py-5 rounded-2xl text-base group shadow-2xl shadow-black/20">
                        Crear Cuenta Gratuita <Sparkles size={16} className="group-hover:rotate-12 transition-transform" />
                    </Link>
                    <Link to="/" className="text-[11px] font-black uppercase tracking-widest border-b border-black pb-0.5 hover:text-minimal-gold hover:border-minimal-gold transition-colors">
                        Ver alojamientos disponibles
                    </Link>
                </div>
            </section>

            <div className="h-20" />
        </div>
    );
};

export default HowItWorksPage;
