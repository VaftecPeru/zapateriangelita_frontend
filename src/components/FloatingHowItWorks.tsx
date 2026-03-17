import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { HelpCircle, ArrowRight } from 'lucide-react';

const FloatingHowItWorks = () => {
    const [isVisible, setIsVisible] = useState(false);
    const [isExpanded, setIsExpanded] = useState(false);
    const location = useLocation();

    const isHiddenPage =
        location.pathname === '/how-it-works' ||
        location.pathname === '/login' ||
        location.pathname === '/register';

    useEffect(() => {
        const timer = setTimeout(() => setIsVisible(true), 1500);
        return () => clearTimeout(timer);
    }, []);

    if (isHiddenPage || !isVisible) return null;

    return (
        <div className="fixed bottom-8 right-8 z-[9999] flex flex-col items-end gap-3 pointer-events-none">
            <div className={`
                bg-black text-white px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest 
                shadow-2xl transition-all duration-500 transform
                ${isExpanded ? 'opacity-100 translate-y-0 scale-100' : 'opacity-0 translate-y-4 scale-95'}
            `}>
                ¿Tienes dudas? Mira cómo funciona Homad
            </div>

            <div className="flex items-center gap-2 pointer-events-auto group">
                <Link
                    to="/how-it-works"
                    onMouseEnter={() => setIsExpanded(true)}
                    onMouseLeave={() => setIsExpanded(false)}
                    className="
                        bg-black text-white h-14 w-14 rounded-full flex items-center justify-center 
                        shadow-[0_20px_50px_rgba(0,0,0,0.3)] hover:shadow-[0_25px_60px_rgba(0,0,0,0.4)]
                        transition-all duration-500 hover:scale-110 active:scale-95
                        relative overflow-hidden group
                    "
                >
                    <div className="absolute inset-0 bg-minimal-olive scale-0 group-hover:scale-100 transition-transform duration-500 rounded-full origin-center"></div>
                    <HelpCircle size={24} className="relative z-10 group-hover:rotate-12 transition-transform duration-500" />
                </Link>

                <Link
                    to="/how-it-works"
                    className="
                        hidden md:flex bg-white border border-black px-6 py-3 rounded-full 
                        text-[11px] font-black uppercase tracking-widest shadow-xl
                        hover:bg-black hover:text-white transition-all duration-300
                    "
                >
                    Guía de uso <ArrowRight size={14} className="ml-2" />
                </Link>
            </div>
        </div>
    );
};

export default FloatingHowItWorks;
