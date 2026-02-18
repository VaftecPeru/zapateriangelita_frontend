import { Wifi, Sparkles, Car, Utensils, Dumbbell, Box } from 'lucide-react';

const services = [
    {
        title: "Internet de Alta Velocidad",
        desc: "Conexión fibra óptica hasta 500 Mbps incluida en todas las propiedades",
        price: "Incluido",
        icon: <Wifi size={24} />,
        popular: true
    },
    {
        title: "Servicio de Limpieza",
        desc: "Limpieza profesional semanal o quincenal de tu espacio",
        price: "Desde $50/mes",
        icon: <Sparkles size={24} />,
        popular: true
    },
    {
        title: "Estacionamiento Privado",
        desc: "Espacio de parking cubierto y seguro para tu vehículo",
        price: "$80/mes",
        icon: <Car size={24} />,
        popular: false
    },
    {
        title: "Servicio de Comidas",
        desc: "Desayuno, almuerzo o cena preparados por chef profesional",
        price: "Desde $200/mes",
        icon: <Utensils size={24} />,
        popular: false
    },
    {
        title: "Gimnasio y Spa",
        desc: "Acceso completo a gimnasio equipado y área de wellness",
        price: "$45/mes",
        icon: <Dumbbell size={24} />,
        popular: true
    },
    {
        title: "Recepción de Paquetes",
        desc: "Servicio de conserjería para recibir y guardar tus entregas",
        price: "Incluido",
        icon: <Box size={24} />,
        popular: false
    }
];

const ServicesSection = () => (
    <section className="py-16 px-6 bg-gray-50/50">
        <div className="max-w-7xl mx-auto">
            <div className="text-center max-w-3xl mx-auto mb-12">
                <h2 className="homad-h2 mb-4">Servicios Adicionales</h2>
                <p className="homad-p-muted text-base">
                    Mejora tu experiencia con nuestros servicios premium diseñados para tu comodidad
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {services.map((s, idx) => (
                    <div key={idx} className="homad-card p-8 flex flex-col h-full border-2 border-black hover:shadow-xl hover:shadow-gray-200/50 transition-all">
                        <div className="flex justify-between items-start mb-6">
                            <div className="homad-icon-bg mb-6 text-black bg-gray-50 p-3 rounded-xl">
                                {s.icon}
                            </div>
                            {s.popular && (
                                <span className="homad-badge-black py-1.5 rounded-lg tracking-widest text-center">
                                    Popular
                                </span>
                            )}
                        </div>

                        <h3 className="text-lg font-bold text-gray-900 mb-2">{s.title}</h3>
                        <p className="homad-p-muted mb-6 flex-grow text-sm">
                            {s.desc}
                        </p>

                        <div className="flex justify-between items-center pt-6 border-t border-gray-100">
                            <span className="text-sm font-bold text-gray-900">{s.price}</span>
                            <button className="text-sm font-black text-gray-900 hover:tracking-wider transition-all uppercase tracking-widest">
                                Agregar
                            </button>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    </section>
);

export default ServicesSection;
