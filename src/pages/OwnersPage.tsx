import { useState, useEffect, useRef } from 'react';
import {
  ShieldCheck,
  TrendingUp,
  ArrowRight,
  CheckCircle2,
  BarChart3,
  Settings,
  Users,
  // Sparkles
} from 'lucide-react';
import portadaBg from '../assets/familia3.jpg';
import estadisticasBg from '../assets/estadisticas.jpg';
import familiaBg from '../assets/familia.jpg';
import comofuncionaBg from '../assets/familia2.jpg';

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
    <span ref={elementRef} className="font-black">
      {count.toLocaleString()}{suffix}
    </span>
  );
};

const OwnersPage = () => {

  return (
    <div className="flex flex-col w-full overflow-hidden bg-minimal-beige">

      <section className="relative min-h-[90vh] flex items-center pt-32 pb-20 px-6 md:px-12 overflow-hidden">
        <div
          className="absolute inset-0 z-0 scale-110"
          style={{
            backgroundImage: `linear-gradient(to right, rgba(0,0,0,0.85), rgba(0,0,0,0.4)), url(${portadaBg})`,
            backgroundSize: 'cover',
            backgroundPosition: 'center'
          }}
        />

        <div className="max-w-[90rem] mx-auto w-full relative z-10 text-white">
          <div className="max-w-4xl space-y-10 animate-in fade-in slide-in-from-left duration-1000">
            <h1 className="text-5xl md:text-8xl font-black tracking-tighter leading-[0.9]">
              Propietarios <br />
              de <span className="text-orange-500 relative">
                inmuebles
                <span className="absolute bottom-0 left-0 w-full h-2 bg-orange-500/20 rounded-full"></span>
              </span>
            </h1>

            <p className="text-lg md:text-2xl text-white/70 max-w-2xl leading-relaxed font-bold">
              No solo gestionamos inmuebles. Construimos rentabilidad sostenida mediante tecnología de vanguardia y una hospitalidad impecable para los propietarios más exigentes.
            </p>

            <div className="flex flex-wrap gap-10 pt-4">
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-orange-500/20 flex items-center justify-center border border-orange-500/30">
                  <TrendingUp className="text-orange-400" size={28} />
                </div>
                <div>
                  <p className="text-lg font-black">+30% ROI</p>
                  <p className="text-sm text-white/60 font-medium">Optimización de ingresos</p>
                </div>
              </div>
              <div className="flex items-center gap-4">
                <div className="w-14 h-14 rounded-2xl bg-blue-500/20 flex items-center justify-center border border-blue-500/30">
                  <ShieldCheck className="text-blue-400" size={28} />
                </div>
                <div>
                  <p className="text-lg font-black">100% Seguro</p>
                  <p className="text-sm text-white/60 font-medium">Contratos garantizados</p>
                </div>
              </div>
            </div>
          </div>


          <div className="absolute bottom-0 right-0 z-20 hidden md:block animate-in fade-in slide-in-from-bottom duration-1000">
            <button
              onClick={() => {
                const el = document.getElementById('prop-features');
                el?.scrollIntoView({ behavior: 'smooth' });
              }}
              className="group flex items-center gap-4 px-10 py-6 bg-orange-500 text-white rounded-2xl font-black uppercase tracking-[0.2em] text-sm hover:bg-orange-600 transition-all active:scale-95 shadow-2xl shadow-orange-500/20"
            >
              Hablemos de negocios <ArrowRight size={20} className="group-hover:translate-x-2 transition-transform" />
            </button>
          </div>
        </div>
      </section>


      <section id="prop-features" className="py-24 px-6 md:px-12 bg-[#f0f4f8]">
        <div className="max-w-[90rem] mx-auto">
          <div className="grid md:grid-cols-2 gap-16 items-center mb-32">
            <div className="relative group">
              <div className="absolute -inset-4 bg-minimal-gold/10 rounded-[3rem] blur-2xl group-hover:bg-minimal-gold/20 transition-all duration-700"></div>
              <img
                src={familiaBg}
                alt="Maximizar Ingresos"
                className="relative z-10 w-full rounded-[2.5rem] shadow-2xl object-cover h-[300px] md:h-[500px]"
              />
            </div>
            <div className="space-y-6">
              <p className="text-minimal-gold font-black uppercase tracking-widest text-sm">Rendimiento Optimizado</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                Maximiza tus ingresos con <br />
                <span className="text-orange-500">Umbral Suites</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                Nuestra tecnología de precios dinámicos y marketing multicanal asegura que tu propiedad tenga la máxima visibilidad y los mejores inquilinos posibles. Incrementamos tus ingresos netos entre un 15% y un 30% comparado con el alquiler tradicional.
              </p>
              <ul className="space-y-3 pt-4">
                {['Reportes financieros mensuales', 'Gestión de reservas 24/7', 'Mantenimiento preventivo', 'Limpieza profesional'].map(item => (
                  <li key={item} className="flex items-center gap-3 font-bold text-gray-800">
                    <div className="w-6 h-6 rounded-full bg-orange-100 flex items-center justify-center">
                      <CheckCircle2 size={14} className="text-orange-500" />
                    </div>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          <div className="grid md:grid-cols-2 gap-16 items-center">
            <div className="order-2 md:order-1 space-y-6">
              <p className="text-blue-500 font-black uppercase tracking-widest text-sm">Experiencia Premium</p>
              <h2 className="text-4xl md:text-5xl font-black tracking-tighter leading-tight">
                Transformamos alquileres <br />
                en <span className="text-blue-500 italic">Viviendas de Lujo</span>
              </h2>
              <p className="text-lg text-gray-600 leading-relaxed font-medium">
                No solo gestionamos espacios, creamos hogares. Elevamos el estándar de cada propiedad con diseño de interiores, amenidades modernas y una atención al detalle que atrae a los mejores inquilinos del mercado.
              </p>
              <div className="flex gap-4 pt-6">
                <div className="p-6 bg-white rounded-2xl border border-gray-100 flex-1 shadow-sm">
                  <h4 className="font-black text-3xl text-black">97%</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Ocupación Media</p>
                </div>
                <div className="p-6 bg-white rounded-2xl border border-gray-100 flex-1 shadow-sm">
                  <h4 className="font-black text-3xl text-black">4.9</h4>
                  <p className="text-[10px] text-gray-400 font-black uppercase tracking-widest mt-1">Rating Huéspedes</p>
                </div>
              </div>
            </div>
            <div className="order-1 md:order-2 relative group">
              <div className="absolute -inset-4 bg-blue-500/10 rounded-[3rem] blur-2xl group-hover:bg-blue-500/20 transition-all duration-700"></div>
              <img
                src={comofuncionaBg}
                alt="Transformación Premium"
                className="relative z-10 w-full rounded-[2.5rem] shadow-2xl object-cover h-[300px] md:h-[500px]"
              />
            </div>
          </div>
        </div>
      </section>


      <section className="relative min-h-[600px] py-24 overflow-hidden flex items-center">
        <div
          className="absolute inset-0 z-0 bg-cover bg-center bg-fixed"
          style={{ backgroundImage: `url(${estadisticasBg})` }}
        />
        <div className="absolute inset-0 z-10 bg-black/70 backdrop-blur-md" />

        <div className="container mx-auto px-6 relative z-20">
          <div className="max-w-3xl mb-16">
            <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter leading-none mb-6">
              Por qué confiar en <br />
              <span className="text-orange-400">Umbral Suites</span>
            </h2>
            <p className="text-xl text-white/70 font-medium font-bold">
              Resultados reales para propietarios que buscan la excelencia en la gestión de sus activos inmobiliarios.
            </p>
          </div>

          <div className="flex overflow-x-auto md:grid md:grid-cols-3 gap-8 pb-10 md:pb-0 scroll-smooth snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar">
            {[
              { number: 1500, label: "Habitaciones Gestionadas", suffix: "+", sub: "Garantizamos un flujo constante de ingresos." },
              { number: 97, label: "Ocupación Media", suffix: "%", sub: "Estrategias de marketing de alto impacto." },
              { number: 25, label: "Incremento del NOI", suffix: "%", sub: "Servicios premium que aumentan el valor." }
            ].map((stat, idx) => (
              <div key={idx} className="bg-white/5 backdrop-blur-xl border border-white/10 p-12 rounded-[3rem] hover:bg-white/10 transition-all duration-500 min-w-[320px] snap-center">
                <h3 className="text-6xl font-black text-white mb-3 tracking-tighter">
                  <AnimatedCounter end={stat.number} suffix={stat.suffix} />
                </h3>
                <p className="text-orange-400 font-black uppercase tracking-[0.2em] text-[10px] mb-4">{stat.label}</p>
                <p className="text-white/60 font-bold leading-relaxed">{stat.sub}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="py-24 px-6 md:px-12 bg-minimal-beige">
        <div className="max-w-[90rem] mx-auto text-center mb-16">
          <p className="text-minimal-gold font-black uppercase tracking-widest text-xs mb-4">La Diferencia Umbral</p>
          <h2 className="text-4xl md:text-6xl font-black tracking-tighter">Propietarios de inmuebles: <br /><span className="text-orange-500">¿Por qué somos mejores?</span></h2>
        </div>

        <div className="max-w-[90rem] mx-auto flex overflow-x-auto md:grid md:grid-cols-2 lg:grid-cols-4 gap-8 pb-10 md:pb-0 scroll-smooth snap-x snap-mandatory -mx-6 px-6 md:mx-0 md:px-0 no-scrollbar">
          {[
            {
              icon: <Settings className="text-orange-500" size={32} />,
              title: "Gestión 360°",
              desc: "Desde la limpieza hasta el mantenimiento técnico, nos encargamos de cada detalle sin que tú tengas que intervenir."
            },
            {
              icon: <ShieldCheck className="text-blue-500" size={32} />,
              title: "Seguridad Jurídica",
              desc: "Contratos blindados e investigación exhaustiva de cada inquilino para tu total tranquilidad."
            },
            {
              icon: <BarChart3 className="text-purple-500" size={32} />,
              title: "Transparencia Total",
              desc: "Acceso a un panel de control con estadísticas en tiempo real sobre tus ingresos y gastos."
            },
            {
              icon: <Users className="text-green-500" size={32} />,
              title: "Inquilinos Premium",
              desc: "Atraemos a profesionales y nómadas digitales que valoran y cuidan tu propiedad como si fuera suya."
            }
          ].map((feature, idx) => (
            <div key={idx} className="bg-white p-10 rounded-[3rem] shadow-xl shadow-black/[0.02] hover:shadow-2xl hover:-translate-y-2 transition-all duration-500 group min-w-[280px] snap-center border border-gray-100/50">
              <div className="w-20 h-20 rounded-[2rem] bg-gray-50 flex items-center justify-center mb-8 group-hover:scale-110 group-hover:bg-orange-50 transition-all duration-500">
                {feature.icon}
              </div>
              <h4 className="text-2xl font-black mb-4 tracking-tight">{feature.title}</h4>
              <p className="text-gray-500 font-bold text-sm leading-relaxed">{feature.desc}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
};

export default OwnersPage;
