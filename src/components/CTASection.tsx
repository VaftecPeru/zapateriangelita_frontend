import { ArrowRight } from 'lucide-react';
import React, { useState, useEffect, useRef } from 'react';

const AnimatedCounter: React.FC<{ end: number, duration?: number, suffix?: string }> = ({ end, duration = 1500, suffix = "" }) => {
    const [count, setCount] = useState(0);
    const [isVisible, setIsVisible] = useState(false);
    const elementRef = useRef<HTMLSpanElement>(null);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting) {
                    setIsVisible(true);
                    observer.unobserve(entry.target);
                }
            },
            { threshold: 0.1 }
        );

        if (elementRef.current) {
            observer.observe(elementRef.current);
        }

        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible) return;

        let startTime: number;
        let animationFrame: number;

        const animate = (currentTime: number) => {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);

            setCount(Math.floor(easeProgress * end));

            if (progress < 1) {
                animationFrame = requestAnimationFrame(animate);
            }
        };

        animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [isVisible, end, duration]);

    return <span ref={elementRef}>{count.toLocaleString()}{suffix}</span>;
};

const CTASection = () => (
    <section className="bg-white">
        <div className="py-12 text-center border-t border-gray-100">
            <p className="homad-p-muted font-medium mb-6">¿Necesitas un servicio personalizado?</p>
            <button className="homad-btn-outline px-10 border-gray-900 mx-auto">
                Contáctanos
            </button>
        </div>
        <div className="bg-black text-white py-24 px-6 relative overflow-hidden">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <h2 className="text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">¿Listo para encontrar tu nuevo hogar?</h2>
                    <p className="text-gray-400 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Miles de personas ya confían en Homad para encontrar el espacio perfecto.
                        Únete a nuestra comunidad hoy mismo.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <button className="homad-btn-primary bg-white text-black px-10 py-5 text-base hover:bg-gray-100 transition-colors">
                            Explorar propiedades <ArrowRight size={20} />
                        </button>
                        <button className="homad-btn-secondary bg-transparent border-white/20 text-white px-10 py-5 text-base hover:bg-white/10 transition-colors">
                            Contactar asesor
                        </button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-white/10">
                    <div className="text-center">
                        <p className="text-5xl font-black mb-3 tracking-tighter">
                            <AnimatedCounter end={2500} suffix="+" />
                        </p>
                        <p className="text-gray-500 text-[11px] uppercase tracking-[0.3em] font-extrabold">Propiedades disponibles</p>
                    </div>
                    <div className="text-center">
                        <p className="text-5xl font-black mb-3 tracking-tighter">
                            <AnimatedCounter end={10000} suffix="+" />
                        </p>
                        <p className="text-gray-500 text-[11px] uppercase tracking-[0.3em] font-extrabold">Clientes satisfechos</p>
                    </div>
                    <div className="text-center">
                        <p className="text-5xl font-black mb-3 tracking-tighter">
                            <AnimatedCounter end={98} suffix="%" />
                        </p>
                        <p className="text-gray-500 text-[11px] uppercase tracking-[0.3em] font-extrabold">Tasa de satisfacción</p>
                    </div>
                </div>
            </div>

            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/5 rounded-full blur-[120px] -mr-64 -mt-64" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-white/[0.02] rounded-full blur-[100px] -ml-48 -mb-48" />
        </div>
    </section>
);

export default CTASection;
