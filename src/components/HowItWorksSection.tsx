import { LayoutGrid, MousePointerClick, Calendar, Users, Sparkles } from 'lucide-react';
import { Link } from 'react-router-dom';
import bgImage from '../assets/comofunciona.jpg';

const steps = [
  {
    icon: LayoutGrid,
    title: 'Elige tu hogar',
    description: 'Descubre espacios que se adapten a tu estilo y estilo de vida. Tu hogar ideal —y un nuevo comienzo— empieza aquí.'
  },
  {
    icon: MousePointerClick,
    title: 'Solicita en línea fácilmente',
    description: 'Rellena un breve formulario online para que podamos ponerte en contacto con el espacio ideal y una comunidad respetuosa y acogedora.'
  },
  {
    icon: Calendar,
    title: 'Preparativos para la mudanza',
    description: 'Te enviaremos todo lo que necesitas (códigos, guías de configuración y consejos de expertos) directamente a tu bandeja de entrada.'
  },
  {
    icon: Users,
    title: 'Siéntete como en casa.',
    description: 'Únete a una comunidad increíble y comparte experiencias. No solo encontrarás un nuevo hogar, sino también un nuevo grupo con el que conectar.'
  }
];

const HowItWorksSection = () => {
  return (
    <section className="relative py-24 px-6 overflow-hidden min-h-[800px] flex items-center">
      {/* Background with Overlay */}
      <div className="absolute inset-0 z-0">
        <img 
          src={bgImage} 
          alt="Background" 
          className="w-full h-full object-cover"
        />
        <div className="absolute inset-0 bg-black/60 backdrop-blur-[2px]"></div>
      </div>

      <div className="max-w-7xl mx-auto relative z-10 w-full">
        <h2 className="text-4xl md:text-5xl font-black text-white tracking-tighter mb-16">
          Cómo funciona
        </h2>

        <div className="flex lg:grid lg:grid-cols-4 gap-6 overflow-x-auto no-scrollbar snap-x snap-mandatory mb-20 -mx-6 px-6 lg:mx-0 lg:px-0 scroll-smooth">
          {steps.map((step, idx) => (
            <div 
              key={idx} 
              className="min-w-[85%] md:min-w-[45%] lg:min-w-0 backdrop-blur-xl bg-white/10 border border-white/20 rounded-[2.5rem] p-8 flex flex-col h-[320px] lg:h-full hover:bg-white/15 transition-all duration-500 group snap-center"
            >
              <div className="w-12 h-12 bg-minimal-serene rounded-full flex items-center justify-center mb-10 shadow-lg shadow-minimal-serene/20 group-hover:scale-110 transition-transform">
                <step.icon size={20} className="text-black" />
              </div>
              
              <h3 className="text-xl font-bold text-white mb-4 leading-tight">
                {step.title}
              </h3>
              
              <p className="text-sm text-white/80 leading-relaxed font-medium">
                {step.description}
              </p>
            </div>
          ))}
        </div>

        <div className="flex flex-col items-center gap-8 border-t border-white/10 pt-10">
          <div className="flex flex-col md:flex-row items-center gap-8">
            <Link to="/register">
              <button className="bg-black hover:bg-white hover:text-black text-white border border-white/20 px-10 py-5 rounded-2xl font-black text-sm uppercase tracking-wider flex items-center gap-3 transition-all hover:scale-105 active:scale-95 shadow-2xl group">
                Crear Cuenta Gratuita
                <Sparkles size={18} className="group-hover:rotate-12 transition-transform" />
              </button>
            </Link>
            
            <Link to="/properties" className="text-sm font-black uppercase tracking-[0.2em] text-white border-b-2 border-white pb-1 hover:text-minimal-serene hover:border-minimal-serene transition-all">
              VER ALOJAMIENTOS DISPONIBLES
            </Link>
          </div>
        </div>
      </div>
    </section>
  );
};

export default HowItWorksSection;
