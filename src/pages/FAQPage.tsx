import { useState } from 'react';
import { ChevronDown, ChevronUp } from 'lucide-react';

const FAQPage = () => {
    const [openIndex, setOpenIndex] = useState<number | null>(0);

    const faqs = [
        {
            question: "¿Cómo puedo reservar una propiedad en Umbral Suites?",
            answer: "Para reservar, primero debe crear una cuenta formal en nuestra plataforma. Una vez iniciada la sesión, podrá seleccionar la propiedad de su interés y seguir el proceso de solicitud, el cual será revisado por nuestro equipo de asesores premium."
        },
        {
            question: "¿Cuáles son los requisitos para inquilinos?",
            answer: "Buscamos mantener una comunidad de confianza. Los requisitos básicos incluyen identificación vigente, comprobante de ingresos y, en algunos casos, referencias de arrendamientos previos. Cada propiedad puede tener requisitos adicionales específicos."
        },
        {
            question: "¿El procesos de pago es seguro?",
            answer: "Absolutamente. Umbral Suites utiliza pasarelas de pago integradas con los más altos estándares de seguridad bancaria. Todas las transacciones son formales, transparentes y generan un comprobante oficial de pago."
        },
        {
            question: "¿Puedo visitar la propiedad antes de alquilar?",
            answer: "Sí, fomentamos las visitas presenciales o virtuales guiadas por nuestros asesores. Puede programar una cita directamente desde el detalle de la propiedad una vez que su perfil básico haya sido verificado."
        },
        {
            question: "¿Qué sucede si tengo un problema durante mi estancia?",
            answer: "Umbral Suites ofrece un canal de soporte premium 24/7 para incidencias críticas. Contamos con una red de servicios de mantenimiento verificados para asegurar que su experiencia de vida sea impecable."
        },
        {
            question: "¿Cómo puedo publicar mi propiedad en Umbral Suites?",
            answer: "Estamos siempre en búsqueda de nuevos espacios premium. Puede iniciar el proceso en la sección 'Registrar propiedad', donde nuestro equipo evaluará si el inmueble cumple con nuestros estándares de calidad y formalidad."
        }
    ];

    return (
        <div className="pt-24 min-h-screen bg-minimal-beige">

            <div className="max-w-7xl mx-auto py-20 px-6">
                <div className="text-center max-w-3xl mx-auto space-y-6">
                    <div className="inline-flex items-center gap-2 px-4 py-2 bg-minimal-serene/20 text-black rounded-full text-[10px] font-black uppercase tracking-widest border border-black/10">
                        Centro de Ayuda
                    </div>
                    <h1 className="text-5xl md:text-6xl font-black tracking-tighter text-[#9BB7D4]">
                        Preguntas Frecuentes
                    </h1>
                    <p className="text-lg text-black font-medium leading-relaxed">
                        Encuentra respuestas rápidas y formales a las dudas más comunes sobre nuestro servicio premium.
                    </p>
                </div>

                <div className="mt-20 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-6">
                    {faqs.map((faq, index) => (
                        <div
                            key={index}
                            className={`bg-white border-2 transition-all duration-300 rounded-2xl h-fit overflow-hidden ${openIndex === index ? 'border-black shadow-lg translate-y-[-2px]' : 'border-black/5 hover:border-black/20'}`}
                        >
                            <button
                                onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                className="w-full px-6 py-5 flex items-center justify-between text-left"
                            >
                                <span className={`text-base font-bold text-black tracking-tight ${openIndex === index ? '' : 'truncate pr-4'}`}>{faq.question}</span>
                                <div className={`p-1.5 rounded-full transition-colors shrink-0 ${openIndex === index ? 'bg-minimal-olive text-white' : 'bg-gray-100 text-black'}`}>
                                    {openIndex === index ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                </div>
                            </button>
                            {openIndex === index && (
                                <div className="px-6 pb-6 animate-fade-in">
                                    <div className="h-px bg-gray-100 mb-4" />
                                    <p className="text-black leading-relaxed font-medium text-sm">
                                        {faq.answer}
                                    </p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default FAQPage;
