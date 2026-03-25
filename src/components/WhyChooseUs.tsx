import { Target, MapPin, Scissors, LayoutGrid } from 'lucide-react';
import nosotrosImg from '../assets/vinosotros.jpg';

const WhyChooseUs = () => {
    const pastelColors = [
        { icon: 'text-[#C48A5A]', bg: 'bg-[#F5E6D6]', title: 'text-[#7B4F2E]' },  // terracota pastel
        { icon: 'text-[#5A8A6E]', bg: 'bg-[#D6F0E4]', title: 'text-[#2E6B4F]' },  // verde menta
        { icon: 'text-[#6E7AB8]', bg: 'bg-[#DDE1F5]', title: 'text-[#3A4480]' },  // lavanda
        { icon: 'text-[#B87A5A]', bg: 'bg-[#F5E2D5]', title: 'text-[#7A4030]' },  // rosa melocotón
    ];

    const features = [
        {
            icon: <Target size={22} strokeWidth={2.5} />,
            title: "Totalmente amoblado, listo para usar.",
            desc: "Nuestros espacios de convivencia y apartamentos están completamente amoblados y equipados con comodidades de primera categoría."
        },
        {
            icon: <MapPin size={22} strokeWidth={2.5} />,
            title: "Ubicaciones privilegiadas",
            desc: "Ubicados en algunos de los barrios más vibrantes de la ciudad, ofreciendo comodidad justo a la puerta de tu casa."
        },
        {
            icon: <Scissors size={22} strokeWidth={2.5} />,
            title: "La vida estudiantil se simplifica.",
            desc: "Ideales para estudiantes, a pocos minutos de las principales universidades, combinando comodidad y conveniencia."
        },
        {
            icon: <LayoutGrid size={22} strokeWidth={2.5} />,
            title: "Encuentra a tu gente",
            desc: "Únete a una comunidad diversa de jóvenes profesionales y estudiantes. Vivirás con personas afines."
        }
    ];

    return (
        <section className="py-12 md:py-16 px-6 md:px-12 bg-minimal-beige relative overflow-hidden">
            <div className="w-full max-w-7xl mx-auto">
                <div className="flex flex-col lg:flex-row gap-12 lg:gap-16 items-center">
                    <div className="flex-1 w-full space-y-8 lg:pr-8">
                        <h2 className="text-2xl md:text-3xl lg:text-4xl font-black tracking-tighter leading-tight text-black">
                            ¿Por qué vivir con <span className="text-[#20B2AA]">nosotros?</span>
                        </h2>
                        
                        <div className="space-y-6 lg:space-y-8">
                            {features.map((f, idx) => (
                                <div key={idx} className="flex gap-4 items-start">
                                    <div className={`mt-1 shrink-0 p-2 rounded-2xl ${pastelColors[idx].bg} ${pastelColors[idx].icon}`}>
                                        {f.icon}
                                    </div>
                                    <div className="space-y-1">
                                        <h3 className={`text-base md:text-lg font-bold leading-tight tracking-tight ${pastelColors[idx].title}`}>{f.title}</h3>
                                        <p className="text-gray-600 text-sm md:text-base leading-relaxed font-medium">
                                            {f.desc}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Right Column - Image */}
                    <div className="flex-1 w-full max-w-lg relative mx-auto">
                        <div className="aspect-[4/3] w-full rounded-[2.5rem] overflow-hidden bg-gray-50 shadow-2xl border border-black/5">
                            <img 
                                src={nosotrosImg} 
                                alt="Personas conviviendo felizmente" 
                                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                            />
                        </div>
                    </div>
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
