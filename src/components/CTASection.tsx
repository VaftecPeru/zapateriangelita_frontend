import { useState, useEffect, useRef } from 'react';
import { ArrowRight, Send, Check } from 'lucide-react';
import { leadService } from '../services/crudService';

const TypingText: React.FC<{ text: string }> = ({ text }) => {
    const [displayedText, setDisplayedText] = useState("");
    const [isVisible, setIsVisible] = useState(false);
    const [isFinished, setIsFinished] = useState(false);
    const elementRef = useRef<HTMLDivElement>(null);
    const hasStartedRef = useRef(false);

    useEffect(() => {
        const observer = new IntersectionObserver(
            ([entry]) => {
                if (entry.isIntersecting && !hasStartedRef.current) {
                    setIsVisible(true);
                    hasStartedRef.current = true;
                }
            },
            { threshold: 0.5 }
        );
        if (elementRef.current) observer.observe(elementRef.current);
        return () => observer.disconnect();
    }, []);

    useEffect(() => {
        if (!isVisible || isFinished) return;

        let charIndex = 0;
        const timer = setInterval(() => {
            if (charIndex <= text.length) {
                setDisplayedText(text.substring(0, charIndex));
                charIndex++;
            } else {
                setIsFinished(true);
                clearInterval(timer);
            }
        }, 50);

        return () => clearInterval(timer);
    }, [isVisible, text, isFinished]);

    return (
        <div ref={elementRef} className="relative text-4xl md:text-5xl lg:text-6xl font-black leading-tight tracking-tighter mb-8 max-w-lg min-h-[1.2em]">
            <span className="opacity-0 pointer-events-none select-none" aria-hidden="true">
                {text}
            </span>
            <div className="absolute inset-0 pointer-events-none">
                <span className="inline">
                    {displayedText}
                    <span className={`inline-block w-[3px] h-[0.8em] bg-[#708238] ml-2 align-middle ${isFinished ? 'animate-pulse' : 'opacity-100'}`}></span>
                </span>
            </div>
        </div>
    );
};

const CTASection = () => {
    const [currentStep, setCurrentStep] = useState(1);
    const [formData, setFormData] = useState<any>({
        duration: '',
        location: '',
        otherLocation: '',
        spaceType: '',
        budget: '',
        timeline: '',
        name: '',
        phone: '',
        email: ''
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);

    const totalSteps = 6;

    const formatPhoneNumber = (value: string) => {
        const numbers = value.replace(/\D/g, '').slice(0, 9);
        const parts = [];
        for (let i = 0; i < numbers.length; i += 3) {
            parts.push(numbers.substring(i, i + 3));
        }
        return parts.join(' ');
    };

    const handleOptionSelect = (field: string, value: string) => {
        if (field === 'phone') {
            const formatted = formatPhoneNumber(value);
            setFormData((prev: any) => ({ ...prev, [field]: formatted }));
        } else {
            setFormData((prev: any) => ({ ...prev, [field]: value }));
        }
    };

    const nextStep = () => {
        if (currentStep < totalSteps) {
            setCurrentStep(currentStep + 1);
        } else {
            handleSubmit();
        }
    };

    const prevStep = () => {
        if (currentStep > 1) {
            setCurrentStep(currentStep - 1);
        }
    };

    const isStepValid = () => {
        switch (currentStep) {
            case 1: return !!formData.duration;
            case 2: return !!formData.location && (formData.location !== 'Otros' || !!formData.otherLocation);
            case 3: return !!formData.spaceType;
            case 4: return !!formData.budget;
            case 5: return !!formData.timeline;
            case 6: {
                const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
                return (
                    !!formData.name && 
                    emailRegex.test(formData.email) && 
                    formData.phone.replace(/\s/g, '').length === 9
                );
            }
            default: return false;
        }
    };

    const handleSubmit = async () => {
        if (!isStepValid()) return;

        setIsSubmitting(true);
        try {
            const finalLocation = formData.location === 'Otros' ? `Otros: ${formData.otherLocation}` : formData.location;
            
            await leadService.trackLead('service', 0, {
                first_name: formData.name,
                last_name: '(Funnel)',
                email: formData.email,
                phone: `+51 ${formData.phone}`,
                property_title: 'Interés General - Funnel',
                additional_services: [
                    { name: 'Duración', price: 0 },
                    { name: formData.duration, price: 0 },
                    { name: 'Zona', price: 0 },
                    { name: finalLocation, price: 0 },
                    { name: 'Espacio', price: 0 },
                    { name: formData.spaceType, price: 0 },
                    { name: 'Presupuesto', price: 0 },
                    { name: formData.budget, price: 0 },
                    { name: 'Timeline', price: 0 },
                    { name: formData.timeline, price: 0 }
                ]
            });
            setIsSuccess(true);
        } catch (error) {
            console.error('Error sending funnel lead:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const renderStep = () => {
        switch (currentStep) {
            case 1:
                return (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-500">
                        <h3 className="text-xl md:text-2xl font-black text-black mb-6 tracking-tighter">¿Cuánto tiempo piensas quedarte?</h3>
                        <p className="text-gray-400 text-xs mb-6">Por favor, elija una opción.</p>
                        <div className="space-y-3 mb-8">
                            {['3-6 meses', '7-11 meses', '12 meses o más'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect('duration', option)}
                                    className={`w-full py-4 px-6 rounded-xl border transition-all text-left flex justify-between items-center font-bold text-sm ${formData.duration === option
                                            ? 'border-[#708238] bg-[#708238]/10 text-black shadow-sm'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                        }`}
                                >
                                    {option}
                                    {formData.duration === option && <Check size={18} className="text-[#708238]" />}
                                </button>
                            ))}
                        </div>
                        <p className="text-gray-400 text-xs italic text-center">No importa cuánto tiempo te quedes, te sentirás como en casa.</p>
                    </div>
                );
            case 2:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl md:text-2xl font-black text-black mb-6 tracking-tighter">¿Qué zona de Lima prefieres?</h3>
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {['Miraflores / San Isidro', 'Barranco / Chorrillos', 'Surco / La Molina', 'Magdalena / San Miguel', 'Otros'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect('location', option)}
                                    className={`w-full py-4 px-6 rounded-xl border transition-all text-left flex justify-between items-center font-bold text-sm ${formData.location === option
                                            ? 'border-[#708238] bg-[#708238]/10 text-black shadow-sm'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                        }`}
                                >
                                    {option}
                                    {formData.location === option && <Check size={18} className="text-[#708238]" />}
                                </button>
                            ))}
                        </div>
                        {formData.location === 'Otros' && (
                            <div className="animate-in fade-in slide-in-from-top-2 duration-300 mb-8">
                                <input
                                    type="text"
                                    value={formData.otherLocation}
                                    onChange={(e) => handleOptionSelect('otherLocation', e.target.value)}
                                    placeholder="Escribe tu distrito preferido..."
                                    className="w-full px-5 py-4 bg-gray-50 border border-[#708238]/30 rounded-xl font-bold focus:ring-2 focus:ring-[#708238]/20 outline-none transition-all text-sm"
                                />
                            </div>
                        )}
                    </div>
                );
            case 3:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl md:text-2xl font-black text-black mb-6 tracking-tighter">¿Qué tipo de alojamiento buscas?</h3>
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {['Habitación Privada (Coliving)', 'Estudio Completo', 'Departamento de 2-3 habs.'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect('spaceType', option)}
                                    className={`w-full py-4 px-6 rounded-xl border transition-all text-left flex justify-between items-center font-bold text-sm ${formData.spaceType === option
                                            ? 'border-[#708238] bg-[#708238]/10 text-black shadow-sm'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                        }`}
                                >
                                    {option}
                                    {formData.spaceType === option && <Check size={18} className="text-[#708238]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 4:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl md:text-2xl font-black text-black mb-6 tracking-tighter">¿Cuál es tu presupuesto mensual?</h3>
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {['S/ 1,000 - S/ 1,800', 'S/ 1,900 - S/ 2,800', 'S/ 3,000 o más'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect('budget', option)}
                                    className={`w-full py-4 px-6 rounded-xl border transition-all text-left flex justify-between items-center font-bold text-sm ${formData.budget === option
                                            ? 'border-[#708238] bg-[#708238]/10 text-black shadow-sm'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                        }`}
                                >
                                    {option}
                                    {formData.budget === option && <Check size={18} className="text-[#708238]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 5:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl md:text-2xl font-black text-black mb-6 tracking-tighter">¿Cuándo planeas mudarte?</h3>
                        <div className="grid grid-cols-1 gap-3 mb-8">
                            {['¡Inmediato!', 'En los próximos 30 días', 'En más de un mes'].map((option) => (
                                <button
                                    key={option}
                                    onClick={() => handleOptionSelect('timeline', option)}
                                    className={`w-full py-4 px-6 rounded-xl border transition-all text-left flex justify-between items-center font-bold text-sm ${formData.timeline === option
                                            ? 'border-[#708238] bg-[#708238]/10 text-black shadow-sm'
                                            : 'border-gray-100 hover:border-gray-200 text-gray-500'
                                        }`}
                                >
                                    {option}
                                    {formData.timeline === option && <Check size={18} className="text-[#708238]" />}
                                </button>
                            ))}
                        </div>
                    </div>
                );
            case 6:
                return (
                    <div className="animate-in fade-in slide-in-from-right-4 duration-500">
                        <h3 className="text-xl md:text-2xl font-black text-black mb-4 tracking-tighter">¡Casi listo!</h3>
                        <p className="text-gray-400 text-xs mb-6">Déjanos tus datos para enviarte las mejores opciones.</p>
                        <div className="space-y-4 mb-4">
                            <input
                                type="text"
                                value={formData.name}
                                onChange={(e) => handleOptionSelect('name', e.target.value)}
                                placeholder="Nombre Completo"
                                className="w-full px-5 py-4 bg-gray-50 border border-gray-100 rounded-xl font-bold focus:ring-2 focus:ring-[#708238]/20 outline-none transition-all text-sm"
                            />
                            <div className="relative">
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleOptionSelect('email', e.target.value.toLowerCase().trim())}
                                    placeholder="Correo Electrónico (ej: usuario@gmail.com)"
                                    className={`w-full px-5 py-4 bg-gray-50 border rounded-xl font-bold focus:ring-2 focus:ring-[#708238]/20 outline-none transition-all text-sm ${formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) ? 'border-red-300' : 'border-gray-100'}`}
                                />
                                {formData.email && !/^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/.test(formData.email) && <p className="text-[10px] text-red-500 mt-1 font-bold ml-2">Debe ser un correo válido (ej: @gmail.com, @hotmail.com)</p>}
                            </div>
                            <div className="relative">
                                <span className="absolute left-5 top-1/2 -translate-y-1/2 text-gray-400 font-bold text-sm">+51</span>
                                <input
                                    type="tel"
                                    value={formData.phone}
                                    onChange={(e) => handleOptionSelect('phone', e.target.value)}
                                    placeholder="WhatsApp (9 dígitos)"
                                    className={`w-full pl-14 pr-5 py-4 bg-gray-50 border rounded-xl font-bold focus:ring-2 focus:ring-[#708238]/20 outline-none transition-all text-sm ${formData.phone && formData.phone.replace(/\s/g, '').length !== 9 ? 'border-red-300' : 'border-gray-100'}`}
                                />
                                {formData.phone && formData.phone.replace(/\s/g, '').length !== 9 && <p className="text-[10px] text-red-500 mt-1 font-bold ml-2">Debe tener exactamente 9 dígitos</p>}
                            </div>
                        </div>
                    </div>
                );
        }
    };

    if (isSuccess) {
        return (
            <section className="bg-minimal-beige py-24 px-6 flex items-center justify-center min-h-[600px]">
                <div className="max-w-md w-full text-center animate-in zoom-in duration-500">
                    <div className="w-20 h-20 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-8 shadow-xl shadow-green-100/50">
                        <Check size={40} />
                    </div>
                    <h3 className="text-3xl font-black text-black mb-4 tracking-tighter">¡Solicitud recibida!</h3>
                    <p className="text-gray-500 font-medium mb-10">Gracias por interesarte en ser parte de la familia Umbral suites, en breve nos comunicaremos contigo via wspp.</p>
                    <button
                        onClick={() => { setCurrentStep(1); setIsSuccess(false); setFormData({}); }}
                        className="text-[#708238] font-black uppercase text-xs tracking-widest hover:underline"
                    >
                        Volver a empezar
                    </button>
                </div>
            </section>
        );
    }

    return (
        <section id="reservar" className="bg-minimal-beige py-20 lg:py-32 px-6">
            <div className="max-w-7xl mx-auto flex flex-col lg:flex-row items-center gap-16 lg:gap-24">


                <div className="w-full lg:w-1/2 text-black">
                    <TypingText text="¿Listo para reservar tu nuevo HOGAR?" />

                    <ul className="space-y-4 mb-12">
                        {[
                            "Espacios exclusivos",
                            "Proceso 100% seguro",
                            "Asesoría personalizada"
                        ].map((item, idx) => (
                            <li key={idx} className="flex items-center gap-3 text-lg font-bold">
                                <div className="w-5 h-5 flex items-center justify-center bg-black/5 rounded-full">
                                    <Check size={14} className="text-black" />
                                </div>
                                {item}
                            </li>
                        ))}
                    </ul>


                    <div className="hidden lg:block animate-pulse">
                        <ArrowRight size={120} strokeWidth={1} className="text-black opacity-10" />
                    </div>
                </div>


                <div className="w-full lg:w-[500px] shrink-0">
                    <div className="bg-white rounded-[2rem] p-8 md:p-12 shadow-2xl shadow-black/5 border border-gray-100 relative overflow-hidden">


                        <div className="text-center mb-8">
                            <div className="flex items-center justify-center gap-2 mb-8">
                                <div className="w-6 h-6 bg-black rounded flex items-center justify-center text-white font-black text-xs">U</div>
                                <span className="text-black font-black text-lg tracking-tighter uppercase">UmbralSuites</span>
                            </div>


                            <div className="flex gap-2 justify-center mb-8">
                                {[...Array(totalSteps)].map((_, i) => (
                                    <div
                                        key={i}
                                        className={`h-1 flex-1 max-w-[30px] rounded-full transition-all duration-500 ${i < currentStep ? 'bg-[#708238]' : 'bg-gray-100'
                                            }`}
                                    />
                                ))}
                            </div>
                        </div>


                        <div className="min-h-[340px]">
                            {renderStep()}
                        </div>

                        <div className="mt-8 flex gap-3">
                            {currentStep > 1 && (
                                <button
                                    onClick={prevStep}
                                    disabled={isSubmitting}
                                    className="flex-1 py-4 rounded-xl font-bold text-gray-500 border border-gray-100 hover:bg-gray-50 transition-all active:scale-[0.98] text-sm"
                                >
                                    Regresar
                                </button>
                            )}
                            <button
                                onClick={nextStep}
                                disabled={isSubmitting || !isStepValid()}
                                className={`flex-[2] py-5 rounded-xl font-black text-white transition-all flex items-center justify-center gap-2 active:scale-[0.98] ${isSubmitting || !isStepValid()
                                        ? 'bg-gray-200 cursor-not-allowed text-gray-400'
                                        : 'bg-[#708238] hover:bg-[#708238]/90 shadow-xl shadow-[#708238]/20'
                                    }`}
                            >
                                {isSubmitting ? 'Enviando...' : currentStep === totalSteps ? 'Enviar solicitud' : 'Continuar'}
                                {!isSubmitting && currentStep < totalSteps && <ArrowRight size={20} />}
                                {!isSubmitting && currentStep === totalSteps && <Send size={20} />}
                            </button>
                        </div>

                    </div>
                </div>
            </div>
        </section>
    );
};

export default CTASection;
