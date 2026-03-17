import { Target, Eye } from 'lucide-react';

const AboutPage = () => {
    const collageImages = [
        "https://images.unsplash.com/photo-1600607687920-4e2a09cf159d?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&q=80&w=400",
        "https://images.unsplash.com/photo-1600566753190-17f0baa2a6c3?auto=format&fit=crop&q=80&w=400"
    ];

    return (
        <div className="pt-24 min-h-screen bg-minimal-beige overflow-hidden">
           
            <section className="relative py-12 md:py-16 px-6 overflow-hidden">
                <div className="max-w-7xl mx-auto relative z-10">
                    <div className="flex flex-col items-center text-center space-y-4">
                        <div className="inline-flex items-center gap-2 px-3 py-1 bg-minimal-olive/10 text-minimal-olive rounded-full text-[9px] font-black uppercase tracking-widest border border-minimal-olive/20 animate-fade-in shadow-sm">
                            Nuestra Historia
                        </div>
                        <h1 className="text-4xl md:text-6xl font-black tracking-tighter text-black max-w-2xl leading-none animate-slide-up">
                            Más que una casa, <br />
                            <span className="text-minimal-olive">un nuevo comienzo.</span>
                        </h1>
                    </div>
                </div>
            </section>

            
            <section className="pb-20 px-6">
                <div className="max-w-7xl mx-auto bg-white rounded-[3rem] p-8 md:p-12 shadow-xl relative z-20 border border-black/5">
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">

                       
                        <div className="lg:col-span-7 space-y-8">
                            <div className="space-y-4">
                                <h2 className="text-3xl font-black tracking-tight text-black">
                                    ¿Qué es Homad?
                                </h2>
                                <p className="text-base text-gray-600 font-medium leading-relaxed">
                                    Somos el primer ecosistema premium diseñado para la nueva generación de buscadores de hogares. En Homad, curamos experiencias habitacionales que conectan personas con espacios que inspiran, garantizando seguridad y diseño formal en cada paso.
                                </p>
                            </div>

                         
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                <div className="p-6 bg-minimal-olive/5 rounded-2xl border border-minimal-olive/10 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-minimal-olive text-white rounded-lg flex items-center justify-center">
                                            <Target size={16} />
                                        </div>
                                        <h3 className="text-lg font-black text-minimal-olive italic">Misión</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-snug">
                                        Elevar el arrendamiento con soluciones de alta calidad que fomenten el bienestar y estabilidad.
                                    </p>
                                </div>

                                <div className="p-6 bg-minimal-serene/5 rounded-2xl border border-minimal-serene/10 space-y-3">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 bg-minimal-serene text-white rounded-lg flex items-center justify-center">
                                            <Eye size={16} />
                                        </div>
                                        <h3 className="text-lg font-black text-minimal-serene italic">Visión</h3>
                                    </div>
                                    <p className="text-sm text-gray-600 font-medium leading-snug">
                                        Ser el referente transformando la interacción con los espacios mediante innovación constante.
                                    </p>
                                </div>
                            </div>
                        </div>

                      
                        <div className="lg:col-span-5 relative grid grid-cols-2 gap-3 md:gap-4 h-full">
                            {collageImages.map((src, idx) => (
                                <div
                                    key={idx}
                                    className={`aspect-square rounded-xl md:rounded-2xl overflow-hidden shadow-sm border-2 border-white ${idx % 2 !== 0 ? 'translate-y-4' : ''
                                        }`}
                                >
                                    <img
                                        src={src}
                                        alt={`Collage ${idx}`}
                                        className="w-full h-full object-cover"
                                    />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </section>

            <div className="h-10 w-full" />
        </div>
    );
};

export default AboutPage;
