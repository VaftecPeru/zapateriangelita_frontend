import { useEffect } from 'react';
import { ArrowLeft, ShieldCheck } from 'lucide-react';
import { Link } from 'react-router-dom';

const PrivacyPage = () => {
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
                            <ShieldCheck size={24} />
                        </div>
                        <h1 className="text-4xl md:text-5xl font-black text-black tracking-tighter">
                            Política de Privacidad
                        </h1>
                    </div>

                    <div className="space-y-10">
                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">01</span>
                                Recopilación de Datos
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                En Homad, nos tomamos muy en serio su privacidad. Recopilamos información personal necesaria para procesar sus reservas y mejorar su experiencia, como nombre, correo electrónico, número de teléfono y detalles de pago.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">02</span>
                                Uso de la Información
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Su información se utiliza exclusivamente para:
                            </p>
                            <ul className="mt-4 space-y-2 text-black/60 font-medium list-disc pl-10">
                                <li>Confirmar y gestionar sus reservas.</li>
                                <li>Enviarle actualizaciones relevantes sobre su estancia.</li>
                                <li>Mejorar nuestros servicios y atención al cliente.</li>
                                <li>Cumplir con obligaciones legales y de seguridad.</li>
                            </ul>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">03</span>
                                Seguridad de los Datos
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Implementamos medidas de seguridad técnicas y organizativas para proteger sus datos personales contra acceso no autorizado, pérdida o alteración. Sus datos de pago se procesan de forma cifrada a través de proveedores certificados.
                            </p>
                        </section>

                        <section>
                            <h2 className="text-xl font-black text-black mb-4 flex items-center gap-2">
                                <span className="w-6 h-6 bg-black/5 rounded-lg flex items-center justify-center text-xs">04</span>
                                Sus Derechos
                            </h2>
                            <p className="text-black/60 leading-relaxed font-medium">
                                Usted tiene derecho a acceder, rectificar o eliminar sus datos personales en cualquier momento. Puede contactarnos para ejercer estos derechos a través de info@homad.com.
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

export default PrivacyPage;
