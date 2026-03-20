
import {
    Users,
    ShieldCheck,
    Wallet,
    Bell,
    Smartphone,
    ChevronRight,
    CheckCircle2,
    XCircle,
    Play,
    ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

const ContactAdvisorPage = () => {
    const { settings } = useSettings();

    const handleWhatsAppContact = (topic: string) => {
        const phoneNumber = settings.whatsapp_number;
        if (!phoneNumber) {
            alert("El número de contacto no está configurado.");
            return;
        }
        const message = encodeURIComponent(`Hola, me gustaría recibir asesoría sobre: ${topic}`);
        window.open(`https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${message}`, '_blank');
    };

    return (
        <div className="min-h-screen bg-white">
            {/* Hero Section */}
            <section className="pt-40 pb-20 px-6 bg-minimal-beige/20 overflow-hidden">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 space-y-8 animate-in fade-in slide-in-from-left-8 duration-700">
                        <div className="inline-flex items-center gap-2 px-4 py-2 bg-minimal-olive/10 rounded-full border border-minimal-olive/20">
                            <span className="w-2 h-2 bg-minimal-olive rounded-full animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-minimal-olive">Rentas by Umbral Suites</span>
                        </div>
                        <h1 className="text-5xl lg:text-7xl font-black text-black tracking-tighter leading-[0.9]">
                            Corretaje y <span className="text-minimal-olive italic">administración</span> de tu depa
                        </h1>
                        <p className="text-xl text-gray-500 font-medium max-w-xl leading-relaxed">
                            Nos encargamos de todo para que no te preocupes por nada. Te conseguimos el inquilino ideal y administramos tu propiedad de principio a fin.
                        </p>
                        <div className="flex flex-col sm:flex-row gap-4">
                            <button 
                                onClick={() => handleWhatsAppContact('Corretaje y administración')}
                                className="bg-black text-white px-10 py-5 rounded-2xl font-black text-lg hover:bg-minimal-olive transition-all shadow-[8px_8px_0px_0px_rgba(107,114,84,0.3)] active:shadow-none active:translate-x-1 active:translate-y-1">
                                CONTÁCTANOS AHORA
                            </button>
                            <Link to="/about" className="flex items-center justify-center gap-2 px-10 py-5 rounded-2xl font-black text-lg text-black hover:bg-gray-100 transition-all">
                                Saber más <ArrowRight size={20} />
                            </Link>
                        </div>
                    </div>
                    <div className="flex-1 relative animate-in fade-in slide-in-from-right-8 duration-700">
                        <div className="relative z-10 rounded-[3rem] overflow-hidden border-2 border-black shadow-[20px_20px_0px_0px_rgba(0,0,0,0.05)]">
                            {/* He cambiado la ruta de la imagen local por un placeholder realista para evitar errores de despliegue */}
                            <img
                                src="https://images.unsplash.com/photo-1560518883-ce09059eeffa?auto=format&fit=crop&q=80"
                                alt="Rentas Illustration"
                                className="w-full h-auto"
                            />
                        </div>
                        <div className="absolute -top-10 -right-10 w-40 h-40 bg-minimal-olive/10 rounded-full blur-3xl" />
                        <div className="absolute -bottom-10 -left-10 w-40 h-40 bg-black/5 rounded-full blur-3xl" />
                    </div>
                </div>
            </section>

            {/* Login Bar Section */}
            <section className="py-10 bg-black text-white overflow-hidden relative">
                <div className="max-w-7xl mx-auto px-6 flex flex-col md:flex-row items-center justify-center gap-8 relative z-10">
                    <p className="text-xl font-bold tracking-tight">¿Ya eres usuario de Rentas? Accede a tu panel</p>
                    <Link to="/login" className="px-8 py-3 bg-white text-black rounded-xl font-black text-sm hover:bg-minimal-olive hover:text-white transition-all">
                        INGRESAR AQUÍ
                    </Link>
                </div>
                <div className="absolute top-0 right-1/4 w-full h-full bg-minimal-olive/20 skew-x-12 transform origin-right" />
            </section>

            {/* Services Icons Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12">
                        {[
                            {
                                title: "Promocionamos tu depa",
                                desc: "Invertimos en marketing y publicidad para encontrar inquilinos rápido.",
                                icon: <Users size={32} className="text-minimal-olive" />
                            },
                            {
                                title: "Conseguimos a tu inquilino",
                                desc: "Filtramos y evaluamos con contratos sólidos para tu tranquilidad.",
                                icon: <ShieldCheck size={32} className="text-minimal-olive" />
                            },
                            {
                                title: "Cobramos tu renta",
                                desc: "Uso de tecnología para recaudar tu alquiler mes a mes sin falta.",
                                icon: <Wallet size={32} className="text-minimal-olive" />
                            },
                            {
                                title: "Atendemos incidencias",
                                desc: "Gestionamos el mantenimiento y cualquier eventualidad por ti.",
                                icon: <Bell size={32} className="text-minimal-olive" />
                            },
                        ].map((s, idx) => (
                            <div key={idx} className="group p-10 bg-gray-50 rounded-[2.5rem] border border-black/5 hover:border-black transition-all hover:bg-white hover:shadow-2xl hover:shadow-black/5">
                                <div className="w-16 h-16 bg-white rounded-2xl flex items-center justify-center mb-6 shadow-sm border border-black/5 group-hover:scale-110 transition-transform">
                                    {s.icon}
                                </div>
                                <h3 className="text-xl font-black text-black mb-3">{s.title}</h3>
                                <p className="text-gray-400 font-medium text-sm leading-relaxed">{s.desc}</p>
                            </div>
                        ))}
                    </div>
                </div>
            </section>

            {/* Testimonials / Video Section Snippet */}
            <section className="py-20 px-6 bg-minimal-olive/5">
                <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16">
                    <div className="flex-1 relative group cursor-pointer">
                        <div className="aspect-video bg-black rounded-[2.5rem] overflow-hidden border-2 border-black flex items-center justify-center relative">
                            <div className="w-20 h-20 bg-white/20 backdrop-blur-md rounded-full flex items-center justify-center group-hover:scale-110 transition-transform">
                                <Play size={32} className="text-white fill-white" />
                            </div>
                            <img src="https://images.unsplash.com/photo-1560448204-e02f11c3d0e2?auto=format&fit=crop&q=80" alt="Testimonial" className="absolute inset-0 w-full h-full object-cover opacity-60" />
                        </div>
                    </div>
                    <div className="flex-1 space-y-6">
                        <div className="w-12 h-1 border-t-4 border-minimal-olive" />
                        <h2 className="text-4xl font-black text-black tracking-tighter leading-tight italic">
                            "¡Ayer me entregaron mi primer depa 100% para inversión!"
                        </h2>
                        <p className="text-lg font-medium text-gray-500">
                            Diego Poblete, inversionista feliz recibiendo su propiedad y confiando en Umbral Suites Rentas para la administración integral.
                        </p>
                        <button className="flex items-center gap-2 font-black text-minimal-olive hover:underline underline-offset-8">
                            Ver más historias <ChevronRight size={18} />
                        </button>
                    </div>
                </div>
            </section>

            {/* Tech / App Section */}
            <section className="py-32 px-6">
                <div className="max-w-7xl mx-auto space-y-32">
                    {/* Technology Section */}
                    <div className="flex flex-col lg:flex-row items-center gap-16">
                        <div className="flex-1 space-y-10">
                            <h2 className="text-4xl lg:text-6xl font-black text-black tracking-tighter leading-none">
                                Tecnología que vuelve <span className="text-minimal-olive">todo más simple</span>
                            </h2>
                            <ul className="space-y-6">
                                {[
                                    "Recauda el alquiler y cobra moras automáticamente",
                                    "Revisa tus pagos y estados de cuenta en tiempo real",
                                    "Firma documentos y valida reparaciones online",
                                    "Soporte técnico 24/7 a través de nuestra plataforma"
                                ].map((item, i) => (
                                    <li key={i} className="flex items-center gap-4 group">
                                        <div className="w-6 h-6 bg-minimal-olive rounded-full flex items-center justify-center flex-shrink-0 group-hover:scale-110 transition-transform">
                                            <CheckCircle2 size={14} className="text-white" />
                                        </div>
                                        <span className="text-lg font-medium text-gray-600">{item}</span>
                                    </li>
                                ))}
                            </ul>
                            <button 
                                onClick={() => handleWhatsAppContact('Plataforma tecnológica')}
                                className="px-10 py-5 bg-minimal-olive text-white rounded-2xl font-black shadow-xl shadow-minimal-olive/20 hover:scale-105 transition-all">
                                SOLICITAR PLATAFORMA
                            </button>
                        </div>
                        <div className="flex-1 relative flex justify-center">
                            <div className="relative z-10 w-64 md:w-80 aspect-[1/2] bg-black rounded-[3rem] border-8 border-black shadow-[30px_30px_60px_-15px_rgba(0,0,0,0.3)] overflow-hidden">
                                <img src="https://images.unsplash.com/photo-1512941937669-90a1b58e7e9c?auto=format&fit=crop&q=80" className="w-full h-full object-cover" />
                            </div>
                            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-minimal-olive/5 rounded-full blur-3xl" />
                        </div>
                    </div>

                    {/* App Section */}
                    <div className="flex flex-col lg:flex-row-reverse items-center gap-16 pt-20">
                        <div className="flex-1 space-y-10">
                            <h2 className="text-4xl lg:text-6xl font-black text-black tracking-tighter leading-none">
                                Todo al alcance de <span className="italic">tus manos</span>
                            </h2>
                            <p className="text-xl text-gray-400 font-medium">
                                Administra tus propiedades, cobra tus rentas y maneja toda tu inversión desde la comodidad de tu celular.
                            </p>
                            <div className="flex gap-4">
                                <div className="h-16 w-44 bg-black rounded-xl border border-white/20 flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-all">
                                    <Smartphone size={24} className="text-white mr-2" />
                                    <div className="text-left leading-none">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Descarga en</p>
                                        <p className="text-base text-white font-black">App Store</p>
                                    </div>
                                </div>
                                <div className="h-16 w-44 bg-black rounded-xl border border-white/20 flex items-center justify-center cursor-pointer hover:bg-gray-900 transition-all">
                                    <Smartphone size={24} className="text-white mr-2" />
                                    <div className="text-left leading-none">
                                        <p className="text-[10px] text-gray-400 font-bold uppercase">Disponible en</p>
                                        <p className="text-base text-white font-black">Play Store</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                        <div className="flex-1 relative">
                            <div className="relative z-10 p-10 bg-gray-50 rounded-[3rem] border border-black/5">
                                <img src="https://images.unsplash.com/photo-1551288049-bbbda5366391?auto=format&fit=crop&q=80" className="w-full h-auto rounded-2xl shadow-xl" />
                            </div>
                            <div className="absolute -z-10 -bottom-20 -left-20 w-80 h-80 bg-minimal-olive/10 rounded-full blur-3xl opacity-50" />
                        </div>
                    </div>
                </div>
            </section>

            {/* Comparison Section */}
            <section className="py-32 px-6 bg-black text-white">
                <div className="max-w-7xl mx-auto space-y-16">
                    <div className="text-center space-y-4">
                        <h2 className="text-4xl md:text-6xl font-black tracking-tighter">¡En Umbral Suites nos hacemos <br /><span className="text-minimal-olive">cargo de todo!</span></h2>
                        <p className="text-gray-400 font-medium max-w-2xl mx-auto">Compara la tranquilidad de administrar con Umbral Suites Rentas frente a hacerlo por tu cuenta.</p>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="p-12 rounded-[3rem] border-2 border-white/10 bg-white/5 space-y-8">
                            <h3 className="text-3xl font-black flex items-center gap-4">
                                <div className="w-12 h-12 bg-red-500/20 rounded-2xl flex items-center justify-center text-red-500">
                                    <XCircle size={28} />
                                </div>
                                Sin Umbral Suites
                            </h3>
                            <ul className="space-y-6">
                                {["Tú alquilas", "Tú cobras", "Tú administras", "Tú lidias con reparaciones", "Incertidumbre en pagos"].map((x, i) => (
                                    <li key={i} className="flex items-center gap-4 text-lg text-gray-400">
                                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full" /> {x}
                                    </li>
                                ))}
                            </ul>
                        </div>
                        <div className="p-12 rounded-[3rem] border-2 border-minimal-olive bg-minimal-olive/5 space-y-8 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <CheckCircle2 size={120} className="text-minimal-olive/10 rotate-12" />
                            </div>
                            <h3 className="text-3xl font-black flex items-center gap-4">
                                <div className="w-12 h-12 bg-minimal-olive/20 rounded-2xl flex items-center justify-center text-minimal-olive">
                                    <CheckCircle2 size={28} />
                                </div>
                                Con Umbral Suites
                            </h3>
                            <ul className="space-y-6">
                                {["Nosotros alquilamos", "Nosotros cobramos", "Tú recibes tu renta", "Nosotros gestionamos ruidos/fallas", "Pagos garantizados"].map((x, i) => (
                                    <li key={i} className="flex items-center gap-4 text-lg text-white font-bold">
                                        <div className="w-2 h-2 bg-minimal-olive rounded-full" /> {x}
                                    </li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    <div className="text-center pt-10">
                        <button 
                            onClick={() => handleWhatsAppContact('Inversión mejorada')}
                            className="px-12 py-6 bg-white text-black rounded-2xl font-black text-xl hover:bg-minimal-olive hover:text-white transition-all">
                            EMPIEZA A INVERTIR MEJOR
                        </button>
                    </div>
                </div>
            </section>

            {/* Final CTA Section */}
            <section className="py-24 px-6 bg-minimal-beige/20 text-center">
                <div className="max-w-3xl mx-auto space-y-10">
                    <h2 className="text-4xl md:text-5xl font-black text-black leading-tight tracking-tighter">
                        ¿Listo para dejar la gestión <br /> de tu depa en manos de expertos?
                    </h2>
                    <p className="text-xl text-gray-400 font-medium leading-relaxed">
                        Únete a cientos de inversionistas que ya disfrutan de su renta mensual sin dolores de cabeza.
                    </p>
                    <button 
                        onClick={() => handleWhatsAppContact('Asesoría gratuita')}
                        className="umbralsuites-btn-secondary px-12 py-6 rounded-2xl text-xl font-black">
                        SOLICITAR ASESORÍA GRATUITA
                    </button>
                </div>
            </section>
        </div>
    );
};

export default ContactAdvisorPage;
