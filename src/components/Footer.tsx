import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail } from 'lucide-react';

const Footer = () => {
    return (
        <footer className="bg-white pt-10 pb-8 px-6 border-t border-gray-50">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-x-16 gap-y-10 mb-10">
                    <div className="space-y-4">
                        <div className="flex items-center gap-2">
                            <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">H</div>
                            <span className="text-black font-bold text-xl tracking-tighter">Homad</span>
                        </div>
                        <p className="homad-p-muted max-w-[280px]">
                            Tu plataforma de confianza para encontrar apartamentos y habitaciones amobladas con servicios premium.
                        </p>
                        <div className="flex gap-4">
                            {[Facebook, Instagram, Twitter, Linkedin].map((Icon, idx) => (
                                <div key={idx} className="w-8 h-8 bg-gray-50 rounded-lg flex items-center justify-center text-gray-400 hover:bg-black hover:text-white transition-all cursor-pointer">
                                    <Icon size={16} />
                                </div>
                            ))}
                        </div>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Enlaces Rápidos</h4>
                        <ul className="space-y-2">
                            {["Buscar apartamentos", "Buscar habitaciones", "Servicios adicionales", "Cómo funciona", "Preguntas frecuentes"].map(item => (
                                <li key={item} className="homad-p-muted hover:text-black cursor-pointer transition-colors w-fit">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Empresa</h4>
                        <ul className="space-y-2">
                            {["Sobre nosotros", "Blog", "Carreras", "Términos y condiciones", "Política de privacidad"].map(item => (
                                <li key={item} className="homad-p-muted hover:text-black cursor-pointer transition-colors w-fit">{item}</li>
                            ))}
                        </ul>
                    </div>
                    <div>
                        <h4 className="font-bold text-gray-900 mb-4">Contacto</h4>
                        <ul className="space-y-3">
                            <li className="flex items-start gap-3 homad-p-muted">
                                <MapPin size={16} className="mt-0.5 shrink-0" />
                                <span>Av. Principal 123, Ciudad Principal</span>
                            </li>
                            <li className="flex items-center gap-3 homad-p-muted">
                                <Phone size={16} className="shrink-0" />
                                <span>+1 (234) 567-890</span>
                            </li>
                            <li className="flex items-center gap-3 homad-p-muted">
                                <Mail size={16} className="shrink-0" />
                                <span>info@homad.com</span>
                            </li>
                        </ul>
                    </div>
                </div>
                <div className="pt-6 border-t border-gray-50 flex flex-col md:flex-row justify-between items-center gap-6">
                    <p className="homad-p-muted">© 2026 Homad. Todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        {["Términos", "Privacidad", "Cookies"].map(item => (
                            <span key={item} className="homad-p-muted hover:text-black cursor-pointer transition-colors">{item}</span>
                        ))}
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
