import { useState, useEffect, useRef } from 'react';
import estadisticasBg from '../assets/estadisticas.jpg';

const AnimatedCounter = ({ end, duration = 2000, suffix = "" }: { end: number, duration?: number, suffix?: string }) => {
  const [count, setCount] = useState(0);
  const [isVisible, setIsVisible] = useState(false);
  const elementRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting) {
          setIsVisible(true);
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

    let startTime: number | null = null;
    const animate = (currentTime: number) => {
      if (!startTime) startTime = currentTime;
      const progress = Math.min((currentTime - startTime) / duration, 1);

      const easeOutQuad = (t: number) => t * (2 - t);
      const currentCount = Math.floor(easeOutQuad(progress) * end);

      setCount(currentCount);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [isVisible, end, duration]);

  return (
    <span ref={elementRef}>
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const StatsSection = () => {
  const stats = [
    {
      title: "Más de",
      number: 12000,
      suffix: "",
      label: "inquilinos",
      description: "Los miembros han vivido con nosotros y confían en nuestra comunidad, enriqueciendo así el vibrante entramado de nuestra experiencia de vida.",
      isHighlighted: true
    },
    {
      title: "Más de",
      number: 20,
      suffix: "",
      label: "Nacionalidades",
      description: "Nuestra increíble diversidad garantiza un entorno multicultural donde podrás conectar con gente de todo el mundo y disfrutar de un estilo de vida verdaderamente internacional.",
      isHighlighted: false
    },
    {
      title: "Más de",
      number: 40,
      suffix: "",
      label: "Propiedades",
      description: "Tanto si buscas un apartamento acogedor como una casa compartida espaciosa, nuestra amplia cartera de propiedades te garantiza que encontrarás el lugar perfecto para llamar hogar.",
      isHighlighted: false
    },
    {
      title: "24/7",
      number: 0, 
      suffix: "Apoyo",
      label: "",
      description: "Desde solicitudes de mantenimiento hasta consultas generales, nos aseguramos de que la ayuda esté siempre a solo una llamada o un mensaje de distancia, brindándole tranquilidad y una experiencia de vida sin complicaciones.",
      isHighlighted: false,
      specialValue: "24/7"
    }
  ];

  return (
    <section className="relative min-h-[600px] py-16 md:py-24 overflow-hidden flex items-center">
      <div
        className="absolute inset-0 z-0 bg-cover bg-center bg-no-scroll md:bg-fixed"
        style={{ backgroundImage: `url(${estadisticasBg})` }}
      />

     
      <div className="absolute inset-0 z-10 bg-black/50 backdrop-brightness-50" />

      <div className="container mx-auto px-6 relative z-20">
        <h2 className="text-3xl md:text-4xl font-black text-white tracking-tight mb-12 animate-in fade-in slide-in-from-left duration-700">
          Estadísticas clave
        </h2>

        <div className="flex md:grid md:grid-cols-2 lg:grid-cols-4 gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0">
          {stats.map((stat, idx) => (
            <div
              key={idx}
              className={`min-w-[85%] md:min-w-0 group p-8 rounded-[2rem] transition-all duration-500 hover:scale-[1.02] snap-center ${stat.isHighlighted
                  ? 'bg-[#9BB7D4] text-black shadow-xl shadow-[#9BB7D4]/20 ring-1 ring-black/5'
                  : 'bg-black/30 backdrop-blur-xl border border-white/10 text-white hover:bg-black/40'
                }`}
            >
              <div className="mb-4">
                <p className={`text-sm font-black uppercase tracking-widest mb-1 ${stat.isHighlighted ? 'text-black/60' : 'text-[#9BB7D4]'
                  }`}>
                  {stat.title}
                </p>
                <h3 className="text-4xl md:text-5xl font-black tracking-tighter">
                  {stat.specialValue ? (
                    <span>
                      {stat.specialValue}
                    </span>
                  ) : (
                    <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                  )}
                </h3>
                <p className="text-xl font-bold mt-1 tracking-tight">
                  {stat.label}
                </p>
              </div>

              <div className={`w-12 h-1 mb-6 rounded-full ${stat.isHighlighted ? 'bg-black/80' : 'bg-[#9BB7D4]'
                }`} />

              <p className={`text-sm md:text-base leading-relaxed font-medium transition-colors ${stat.isHighlighted ? 'text-black/90' : 'text-gray-300 group-hover:text-white'
                }`}>
                {stat.description.replace('con nosotros', 'con UmbralSuites')}
              </p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
