import { ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';
import React, { useState, useEffect, useRef } from 'react';

const TypingText: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStartedRef.current) {
                    setIsVisible(true);
                    hasStartedRef.current = true;
                }
            },
            { threshold: 0.5 }
        );
        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || isFinished) return;
        
        let charIndex = 0;
        const timer = setInterval(() => {
            if (charIndex <= text.length) {
                setDisplayedText(text.substring(0, charIndex));
                charIndex++;
            } else {
                setIsFinished(true);
                clearInterval(timer);
            }
        }, 50); // 50ms per character for natural feel

        return () => clearInterval(timer);
    }, [isVisible, text, isFinished]);

    return (
        <div ref={elementRef} className="relative text-4xl md:text-6xl font-extrabold mb-8 tracking-tighter">
            {/* Reserve space with invisible text to prevent layout jumps */}
            <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
                {text}
            </span>
            {/* Absolute overlay for the actual typed text */}
            <div className="absolute inset-0 flex justify-center items-center pointer-events-none">
                <span className="inline">
                    {displayedText}
                    <span className={`inline-block w-[3px] h-[0.8em] bg-minimal-gold ml-1 align-middle ${isFinished ? 'animate-pulse' : 'animate-[blink_1s_infinite]'}`}></span>
                </span>
            </div>
            {/* Add blink animation to global styles via style tag or similar if needed, 
                but Tailwind's animate-pulse works too. I'll define a custom blink style below. */}
            <style dangerouslySetInnerHTML={{ __html: `
                @keyframes blink {
                    0%, 100% { opacity: 1; }
                    50% { opacity: 0; }
                }
            `}} />
        </div>
    );
};

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

        <div id="contacto" className="bg-minimal-header text-black py-24 px-6 relative overflow-hidden border-y border-black">
            <div className="max-w-7xl mx-auto relative z-10">
                <div className="text-center max-w-4xl mx-auto mb-24">
                    <TypingText text="¿Listo para encontrar tu nuevo hogar?" />
                    <p className="text-black/60 text-lg mb-12 max-w-2xl mx-auto leading-relaxed">
                        Miles de personas ya confían en Umbral Suites para encontrar el espacio perfecto.
                        Únete a nuestra comunidad hoy mismo.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4">
                        <Link
                            to="/properties"
                            className="bg-minimal-serene text-white px-10 py-5 text-base rounded-xl font-bold border border-black hover:bg-black hover:text-white transition-all active:scale-95 flex items-center justify-center gap-2 shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            Explorar propiedades <ArrowRight size={20} />
                        </Link>
                        <Link
                            to="/contact-advisor"
                            className="bg-minimal-olive text-white border border-black px-10 py-5 text-base rounded-xl font-bold hover:bg-black hover:text-white transition-all active:scale-95 flex items-center justify-center shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] active:shadow-none active:translate-x-1 active:translate-y-1"
                        >
                            Contactar asesor
                        </Link>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-12 pt-20 border-t border-white/10">
                    <div className="text-center">
                        <p className="text-5xl font-black mb-3 tracking-tighter text-minimal-serene">
                            <AnimatedCounter end={2500} suffix="+" />
                        </p>
                        <p className="text-black/40 text-[11px] uppercase tracking-[0.3em] font-extrabold">Propiedades disponibles</p>
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
