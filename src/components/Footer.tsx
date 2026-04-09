import { Facebook, Instagram, Twitter, Linkedin, MapPin, Phone, Mail } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSettings } from '../hooks/useSettings';

const Footer = () => {
    const { settings } = useSettings();

    return (
        <footer id="contacto" className="bg-[#334756] text-white pt-20 pb-12 px-6">
            <div className="max-w-7xl mx-auto">
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-x-8 gap-y-12 mb-16 px-4 md:px-0">
                    <div className="col-span-2 lg:col-span-1 flex flex-col items-start text-left space-y-6">
                        <div className="flex items-center gap-2">
                            <div className="w-9 h-9 bg-black rounded-xl flex items-center justify-center text-white font-bold text-lg">U</div>
                            <span className="text-black font-black text-2xl tracking-tighter">Umbral Suites</span>
                        </div>
                        <p className="text-white/80 text-sm leading-relaxed max-w-[280px]">
                            Tu plataforma de confianza para encontrar apartamentos y habitaciones amobladas con servicios premium.
                        </p>
                        <div className="flex gap-3">
                            {[
                                { Icon: Facebook, href: 'https://facebook.com/umbralsuites' },
                                { Icon: Instagram, href: 'https://instagram.com/umbralsuites' },
                                { Icon: Twitter, href: 'https://twitter.com/umbralsuites' },
                                { Icon: Linkedin, href: 'https://linkedin.com/company/umbralsuites' }
                            ].map((social, idx) => (
                                <a 
                                    key={idx} 
                                    href={social.href} 
                                    target="_blank" 
                                    rel="noreferrer"
                                    className="w-10 h-10 bg-black/10 border border-white/10 rounded-xl flex items-center justify-center text-white hover:bg-black hover:text-white hover:scale-110 active:scale-90 transition-all cursor-pointer shadow-sm"
                                >
                                    <social.Icon size={18} />
                                </a>
                            ))}
                        </div>
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-8">Enlaces Rápidos</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Propiedades", path: "/#apartamentos" },
                                { label: "Preguntas frecuentes", path: "/faq" }
                            ].map(item => (
                                <li key={item.label} className="text-white/90 hover:text-black active:scale-95 transition-all w-fit cursor-pointer text-sm font-bold">
                                    {item.path.startsWith('/#') ? (
                                        <a href={item.path}>{item.label}</a>
                                    ) : (
                                        <Link to={item.path}>{item.label}</Link>
                                    )}
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-8">Empresa</h4>
                        <ul className="space-y-4">
                            {[
                                { label: "Sobre nosotros", path: "/about" }
                            ].map(item => (
                                <li key={item.label} className="text-white/90 hover:text-black cursor-pointer transition-colors w-fit text-sm font-bold">
                                    <Link to={item.path}>{item.label}</Link>
                                </li>
                            ))}
                        </ul>
                    </div>

                    <div className="flex flex-col items-start text-left">
                        <h4 className="text-[10px] font-black text-black uppercase tracking-[0.2em] mb-8">Contacto</h4>
                        <ul className="space-y-5">
                            <li className="flex items-start gap-3 text-white/90 text-sm font-bold">
                                <MapPin size={18} className="shrink-0 text-black" />
                                <span>Av. Principal 123, Lima</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/90 text-sm font-bold">
                                <Phone size={18} className="shrink-0 text-black" />
                                <span>{settings.whatsapp_number ? `+${settings.whatsapp_number}` : 'No configurado'}</span>
                            </li>
                            <li className="flex items-center gap-3 text-white/90 text-sm font-bold">
                                <Mail size={18} className="shrink-0 text-black" />
                                <span>hola@umbralsuites.com</span>
                            </li>
                        </ul>
                    </div>
                </div>

                <div className="pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-8">
                    <p className="text-white/60 text-[13px] font-bold italic">© 2026 Umbral Suites. Todos los derechos reservados.</p>
                    <div className="flex gap-8">
                        <Link to="/terms" className="text-white/60 text-[13px] font-bold hover:text-black cursor-pointer transition-colors">Términos</Link>
                        <Link to="/privacy" className="text-white/60 text-[13px] font-bold hover:text-black cursor-pointer transition-colors">Privacidad</Link>
                        <span className="text-white/60 text-[13px] font-bold hover:text-black cursor-pointer transition-colors">Cookies</span>
                    </div>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
