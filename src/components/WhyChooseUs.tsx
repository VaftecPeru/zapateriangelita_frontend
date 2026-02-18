import { ShieldCheck, Clock, Headphones, Zap, Star, Home } from 'lucide-react';

const features = [
    {
        icon: <ShieldCheck size={24} />,
        title: "Seguro y Confiable",
        desc: "Todas nuestras propiedades están verificadas y cumplen con estándares de calidad."
    },
    {
        icon: <Clock size={24} />,
        title: "Disponibilidad 24/7",
        desc: "Atención al cliente disponible en todo momento para resolver tus dudas."
    },
    {
        icon: <Headphones size={24} />,
        title: "Soporte Personalizado",
        desc: "Equipo dedicado para ayudarte a encontrar el espacio perfecto para ti."
    },
    {
        icon: <Zap size={24} />,
        title: "Proceso Simple",
        desc: "Reserva fácil y rápida con confirmación inmediata de tu apartamento."
    },
    {
        icon: <Star size={24} />,
        title: "Calidad Garantizada",
        desc: "Propiedades seleccionadas cuidadosamente para tu comodidad y satisfacción."
    },
    {
        icon: <Home size={24} />,
        title: "Totalmente Amoblado",
        desc: "Todos los espacios vienen completamente equipados y listos para habitar."
    }
];

const WhyChooseUs = () => {
    return (
        <section className="py-16 px-6 bg-white">
            <div className="max-w-7xl mx-auto">
                <div className="text-center max-w-3xl mx-auto mb-12">
                    <h2 className="homad-h2 mb-4">¿Por qué elegir Homad?</h2>
                    <p className="homad-p-muted text-base">
                        Ofrecemos la mejor experiencia en búsqueda y reserva de apartamentos y habitaciones amobladas
                    </p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {features.map((f, idx) => (
                        <div key={idx} className="homad-card p-8 flex flex-col items-start border-2 border-black hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                            <div className="homad-icon-bg mb-6 text-black bg-gray-50 p-3 rounded-xl">
                                {f.icon}
                            </div>
                            <h3 className="text-lg font-bold text-gray-900 mb-2">{f.title}</h3>
                            <p className="homad-p-muted text-sm">
                                {f.desc}
                            </p>
                        </div>
                    ))}
                </div>
            </div>
        </section>
    );
};

export default WhyChooseUs;
