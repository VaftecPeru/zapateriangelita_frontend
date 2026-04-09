import { Users, Home, Smile, ShieldCheck, Sparkles, Award, Lock, Zap, Heart, Leaf } from 'lucide-react';

const values = [
  { icon: Users, label: 'Familia' },
  { icon: Home, label: 'Casa hogar' },
  { icon: Smile, label: 'Felicidad' },
  { icon: ShieldCheck, label: 'Confianza' },
  { icon: Sparkles, label: 'Moderno' },
  { icon: Award, label: 'Calidad' },
  { icon: Lock, label: 'Seguridad' },
  { icon: Zap, label: 'Innovación' },
  { icon: Heart, label: 'Comunidad' },
  { icon: Leaf, label: 'Sostenible' },
];

const ValuesBar = () => {
  const extendedValues = [...values, ...values, ...values];

  return (
    <section className="bg-[#A0A2A3] py-2 border-y border-black/5 overflow-hidden">
      <div className="max-w-7xl mx-auto px-6 mb-1">
        <p className="text-center text-[8px] uppercase tracking-[0.3em] font-black text-black opacity-40">
          Nuestros Valores Fundamentales
        </p>
      </div>
      
      <div className="relative flex overflow-x-hidden">
        <div className="animate-marquee flex items-center gap-12 md:gap-24 py-1">
          {extendedValues.map((val, idx) => (
            <div key={idx} className="flex flex-col items-center gap-1.5 min-w-fit group">
              <div className="p-1.5 bg-black/5 rounded-xl group-hover:bg-black/10 transition-colors duration-300">
                <val.icon className="w-4 h-4 text-black" strokeWidth={1} />
              </div>
              <span className="text-[9px] font-black uppercase tracking-widest text-black/70 group-hover:text-black transition-colors duration-300">
                {val.label}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default ValuesBar;
