import { useEffect } from 'react';
import { ArrowLeft, Scale } from 'lucide-react';
import { Link } from 'react-router-dom';

const TermsPage = () => {
    useEffect(() => {
        window.scrollTo(0, 0);
    }, []);

    return (
        <div className="min-h-screen bg-minimal-beige pt-32 pb-20 px-6 font-inter">
            <div className="max-w-4xl mx-auto">
                <Link
                    to="/"
                    className="inline-flex items-center gap-2 text-black/50 hover:text-black transition-colors mb-12 group select-none"
                >
                    <ArrowLeft size={20} className="group-hover:-translate-x-1 transition-transform" />
                    <span className="font-bold text-sm tracking-tight uppercase">Regresar al inicio</span>
                </Link>

                <div className="bg-white rounded-[2.5rem] p-10 md:p-16 border border-black shadow-sm">
                    <div className="flex items-center gap-4 mb-8">
                        <div className="w-12 h-12 bg-black rounded-2xl flex items-center justify-center text-white">
                            <Scale size={24} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter">
                            Términos y Condiciones
                        </h1>
                    </div>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">01</span>
                                Aceptación de los Términos
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Al acceder y utilizar la plataforma Homad, usted acepta cumplir y estar sujeto a los siguientes términos y condiciones de uso. Estos términos rigen su relación con Homad en relación con este sitio web.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">02</span>
                                Uso del Servicio
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Nuestra plataforma facilita la conexión entre propietarios y huéspedes para el alquiler de apartamentos y habitaciones amobladas. Homad no es propietario ni gestiona directamente todas las propiedades listadas.
                            </p>
                            <ul className="mt-4 space-y-2 text-black/60 font-medium list-disc pl-10">
                                <li>El usuario debe ser mayor de edad para realizar una reserva.</li>
                                <li>Toda la información proporcionada debe ser veraz y actualizada.</li>
                                <li>Se prohíbe el uso de la plataforma para fines ilegales o no autorizados.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">03</span>
                                Reservas y Pagos
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Los precios y disponibilidad están sujetos a cambios sin previo aviso. La reserva se confirma una vez que el pago ha sido procesado exitosamente a través de nuestra pasarela de pagos segura.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">04</span>
                                Cancelaciones y Reembolsos
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Cada propiedad puede tener sus propias políticas de cancelación. Por favor, revise detenidamente los detalles de la propiedad antes de confirmar su reserva. Los reembolsos se procesarán de acuerdo con la política aplicada al momento de la reserva.
                            </p>
                        </section>

                        <section className="pt-10 border-t border-black/5 mt-20">
                            <p className="text-[11px] text-black/40 font-black uppercase tracking-widest text-center">
                                Última actualización: 25 de Febrero, 2026
                            </p>
                        </section>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default TermsPage;
