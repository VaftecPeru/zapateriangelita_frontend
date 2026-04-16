import { useState, useEffect, useRef } from 'react';
import { X, Bed, Bath, Square, MapPin, Star, CheckCircle2, Users, User, Phone, Wifi, Car, Tv, Droplets, Dumbbell, Coffee, Wind, Utensils, Shield, Sun, PawPrint, Home, Laptop, ArrowUpCircle, ClipboardList, FileText, ChevronRight, Mail, Info } from 'lucide-react';
import { useSettings } from '../hooks/useSettings';
import { useAuth } from '../hooks/useAuth';
import { propertyService, leadService, additionalServiceService, AdditionalService } from '../services/crudService';
import AuthModal from './AuthModal';

interface PropertyDetailsProps {
    property: any;
    allProperties?: any[];
    onClose: () => void;
    onSelectProperty?: (p: any) => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, allProperties = [], onClose, onSelectProperty }) => {
    const scrollContainerRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        if (scrollContainerRef.current) {
            scrollContainerRef.current.scrollTo({ top: 0, behavior: 'smooth' });
        }
    }, [property?.id]);

    const getAmenityIcon = (amenityText: string) => {
        const text = amenityText.toLowerCase();
        if (text.includes('wi-fi') || text.includes('wifi') || text.includes('internet')) return <Wifi size={18} className="text-black/60" />;
        if (text.includes('estacionamiento') || text.includes('parqueo') || text.includes('garaje') || text.includes('cochera')) return <Car size={18} className="text-black/60" />;
        if (text.includes('tv') || text.includes('televisor') || text.includes('pantalla') || text.includes('netflix') || text.includes('cable')) return <Tv size={18} className="text-black/60" />;
        if (text.includes('piscina') || text.includes('alberca') || text.includes('jacuzzi')) return <Droplets size={18} className="text-black/60" />;
        if (text.includes('lavandería') || text.includes('lavadora') || text.includes('secadora')) return <Droplets size={18} className="text-black/60" />;
        if (text.includes('gimnasio') || text.includes('gym') || text.includes('entrenamiento')) return <Dumbbell size={18} className="text-black/60" />;
        if (text.includes('cocina') || text.includes('refrigeradora') || text.includes('microondas') || text.includes('horno')) return <Utensils size={18} className="text-black/60" />;
        if (text.includes('comida') || text.includes('comedor') || text.includes('restaurante')) return <Utensils size={18} className="text-black/60" />;
        if (text.includes('aire') || text.includes('acondicionado') || text.includes('calefacción') || text.includes('ventilador')) return <Wind size={18} className="text-black/60" />;
        if (text.includes('café') || text.includes('desayuno') || text.includes('cafetera')) return <Coffee size={18} className="text-black/60" />;
        if (text.includes('seguridad') || text.includes('cámaras') || text.includes('vigilancia') || text.includes('portero')) return <Shield size={18} className="text-black/60" />;
        if (text.includes('terraza') || text.includes('balcón') || text.includes('patio') || text.includes('jardín')) return <Sun size={18} className="text-black/60" />;
        if (text.includes('mascotas') || text.includes('pet') || text.includes('perro')) return <PawPrint size={18} className="text-black/60" />;
        if (text.includes('trabajo') || text.includes('escritorio') || text.includes('oficina')) return <Laptop size={18} className="text-black/60" />;
        if (text.includes('ascensor') || text.includes('elevador')) return <ArrowUpCircle size={18} className="text-black/60" />;
        if (text.includes('amueblado') || text.includes('muebles')) return <Home size={18} className="text-black/60" />;
        return <CheckCircle2 size={18} className="text-black/60" />;
    };

    const [firstName, setFirstName] = useState('');
    const [lastName, setLastName] = useState('');
    const [email, setEmail] = useState('');
    const [phone, setPhone] = useState('');
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);
    const [errors, setErrors] = useState<{ firstName?: string, lastName?: string, email?: string, phone?: string, checkIn?: string, checkOut?: string }>({});
    const { settings, loading: settingsLoading } = useSettings();
    const [activeImageIndex, setActiveImageIndex] = useState(0);
    const [lightboxIndex, setLightboxIndex] = useState<number | null>(null);
    const [touchStart, setTouchStart] = useState(0);
    const [availableServices, setAvailableServices] = useState<AdditionalService[]>([]);
    const [selectedServiceIds, setSelectedServiceIds] = useState<number[]>([]);
    const [isAuthModalOpen, setIsAuthModalOpen] = useState(false);
    const [showNotification, setShowNotification] = useState<{ message: string, type: 'info' | 'success' | 'error' } | null>(null);
    const { user, isAuthenticated } = useAuth();

    const rawImages: string[] = [];
    if (property.img) rawImages.push(property.img);
    if (Array.isArray(property.images)) {
        property.images.forEach((imgUrl: string) => {
            if (imgUrl && !rawImages.includes(imgUrl)) rawImages.push(imgUrl);
        });
    }
    const images = rawImages.slice(0, 5);

    const today = new Date().toISOString().split('T')[0];

    useEffect(() => {
        if (property?.id) {
            propertyService.trackView(property.id).catch(console.error);
        }
        additionalServiceService.getAll()
            .then(res => setAvailableServices(res.data))
            .catch(err => console.error('Error fetching services:', err));
        
        // Auto-populate user data if authenticated
        if (isAuthenticated && user) {
            const nameParts = user.name.split(' ');
            setFirstName(nameParts[0] || '');
            setLastName(nameParts.slice(1).join(' ') || '');
            setEmail(user.email || '');
        }
    }, [property?.id, isAuthenticated, user]);

    const toggleService = (id: number) => {
        setSelectedServiceIds(prev =>
            prev.includes(id) ? prev.filter(sid => sid !== id) : [...prev, id]
        );
    };

    const handleTouchStart = (e: React.TouchEvent) => {
        setTouchStart(e.targetTouches[0].clientX);
    };

    const handleTouchEnd = (e: React.TouchEvent) => {
        const endX = e.changedTouches[0].clientX;
        handleSwipe(touchStart, endX);
    };

    const handleSwipe = (startX: number, endX: number) => {
        if (!startX || !endX) return;

        const distance = startX - endX;
        const isLeftSwipe = distance > 50;
        const isRightSwipe = distance < -50;

        if (isLeftSwipe && activeImageIndex < images.length - 1) {
            setActiveImageIndex(activeImageIndex + 1);
        }
        if (isRightSwipe && activeImageIndex > 0) {
            setActiveImageIndex(activeImageIndex - 1);
        }
    };

    const handleReserve = async () => {
        const newErrors: any = {};
        if (!firstName) newErrors.firstName = "Campo obligatorio";
        if (!lastName) newErrors.lastName = "Campo obligatorio";
        if (!email) newErrors.email = "Campo obligatorio";
        if (!phone) newErrors.phone = "Campo obligatorio";
        if (!checkIn) newErrors.checkIn = "Campo obligatorio";
        if (!checkOut) newErrors.checkOut = "Campo obligatorio";

        if (checkIn && checkIn < today) {
            newErrors.checkIn = "La fecha no puede ser pasada";
        }

        if (checkIn && checkOut && checkOut <= checkIn) {
            newErrors.checkOut = "Debe ser posterior al ingreso";
        }

        if (Object.keys(newErrors).length > 0) {
            setErrors(newErrors);
            return;
        }

        setErrors({});

        if (!isAuthenticated) {
            setShowNotification({ 
                message: "No tienes una cuenta activa. Por favor, regístrate para continuar con tu reserva.", 
                type: 'info' 
            });
            setIsAuthModalOpen(true);
            setTimeout(() => setShowNotification(null), 4000);
            return;
        }

        if (settingsLoading) return;

        let generatedPassword = null;

        if (property?.id) {
            const selectedServicesDetails = availableServices
                .filter(s => selectedServiceIds.includes(s.id as number))
                .map(s => ({ name: s.name, price: s.price }));

            try {
                const response = await leadService.trackLead('property', property.id, {
                    first_name: firstName,
                    last_name: lastName,
                    email,
                    phone,
                    check_in: checkIn,
                    check_out: checkOut,
                    guests,
                    property_title: property.title,
                    additional_services: selectedServicesDetails
                });
                
                if (response.data?.plain_password) {
                    generatedPassword = response.data.plain_password;
                }
            } catch (err) {
                console.error('Error tracking lead:', err);
            }
        }

        const phoneNumber = settings.whatsapp_number;
        if (!phoneNumber) {
            alert("El número de contacto no está configurado. Por favor, intenta de nuevo más tarde.");
            return;
        }

        const selectedServicesText = availableServices
            .filter(s => selectedServiceIds.includes(s.id as number))
            .map(s => `• ${s.name} (S/ ${s.price})`)
            .join('\n');

        const servicesTotal = availableServices
            .filter(s => selectedServiceIds.includes(s.id as number))
            .reduce((acc, s) => acc + s.price, 0);

        const passwordMsg = generatedPassword 
            ? `\n\n🔑 *Mis Credenciales de Acceso*:\nUsuario: ${email}\nContraseña: ${generatedPassword}\n(Guarda estos datos para ver tu historial en la web)`
            : '';

        const message = `Hola, buen día. Deseo realizar una reserva en Umbral Suite.

Cliente: ${firstName} ${lastName}
Teléfono: ${phone}

Tipo de habitación: ${property.title}.

Fecha de ingreso (Check-in): ${checkIn}
Fecha de salida (Check-out): ${checkOut}
Cantidad de personas: ${guests}${selectedServicesText ? `\n\nServicios Extra:\n${selectedServicesText}\nTotal en Servicios: S/ ${servicesTotal}` : ''}${passwordMsg}

Quedo atento a su confirmación de disponibilidad y a los pasos para garantizar la reserva. ¡Muchas gracias!`;

        const whatsappUrl = `https://wa.me/${phoneNumber.replace(/[^0-9]/g, '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <>
            <div ref={scrollContainerRef} className="fixed inset-0 z-[2000] bg-minimal-beige overflow-y-auto font-inter">

                <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md flex justify-between items-center px-4 sm:px-8 md:px-12 py-4 md:py-6 border-b border-black">
                    <div className="flex items-center gap-2">
                        <div className="w-7 h-7 md:w-8 md:h-8 bg-black rounded flex items-center justify-center text-white font-bold text-sm md:text-base">U</div>
                        <span className="text-black font-bold text-lg md:text-xl tracking-tighter">Umbral Suites</span>
                    </div>
                    <button
                        onClick={onClose}
                        className="flex items-center gap-2 text-black font-bold text-sm hover:opacity-70 transition-opacity"
                    >
                        <X size={20} /> Cerrar
                    </button>
                </div>

                <div className="max-w-7xl mx-auto pb-20 px-4 md:px-6 lg:px-8">

                    <div className="w-full rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-12 bg-gray-100">
                        {images.length === 0 ? (
                            <div className="w-full h-[40vh] flex flex-col items-center justify-center text-gray-400">
                                <Star size={48} strokeWidth={1} />
                                <span className="text-xs font-bold uppercase tracking-widest mt-2">Sin Imágenes</span>
                            </div>
                        ) : (
                            <>
                                <div
                                    className="md:hidden w-full relative cursor-grab active:cursor-grabbing"
                                    style={{ height: '50vw', minHeight: '300px', maxHeight: '70vh' }}
                                    onTouchStart={handleTouchStart}
                                    onTouchEnd={handleTouchEnd}
                                >
                                    <img
                                        src={images[activeImageIndex]}
                                        className="w-full h-full object-cover transition-all duration-500 select-none"
                                        alt={property.title}
                                        draggable={false}
                                    />
                                    {images.length > 1 && (
                                        <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-1.5 bg-black/50 backdrop-blur-md px-3 py-2 rounded-full">
                                            {images.map((_, index) => (
                                                <button
                                                    key={index}
                                                    onClick={() => setActiveImageIndex(index)}
                                                    className={`transition-all ${activeImageIndex === index
                                                        ? 'w-2.5 h-2.5 bg-white'
                                                        : 'w-1.5 h-1.5 bg-white/50 hover:bg-white/75'
                                                        } rounded-full`}
                                                    aria-label={`Ir a imagen ${index + 1}`}
                                                />
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="hidden md:block w-full" style={{ height: '60vh' }}>
                                    {images.length === 1 && (
                                        <img src={images[0]} className="w-full h-full object-cover cursor-zoom-in" onClick={() => setLightboxIndex(0)} />
                                    )}
                                    {images.length === 2 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px', height: '100%' }}>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(0)}><img src={images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(1)}><img src={images[1]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                        </div>
                                    )}
                                    {images.length === 3 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px', height: '100%' }}>
                                            <div style={{ gridRow: 'span 2' }} className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(0)}><img src={images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(1)}><img src={images[1]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(2)}><img src={images[2]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                        </div>
                                    )}
                                    {images.length === 4 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px', height: '100%' }}>
                                            <div style={{ gridRow: 'span 2' }} className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(0)}><img src={images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(1)}><img src={images[1]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(2)}><img src={images[2]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                            <div style={{ gridColumn: 'span 2' }} className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(3)}><img src={images[3]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" /></div>
                                        </div>
                                    )}
                                    {images.length >= 5 && (
                                        <div style={{ display: 'grid', gridTemplateColumns: '2fr 1fr 1fr', gridTemplateRows: '1fr 1fr', gap: '4px', height: '100%' }}>
                                            <div style={{ gridRow: 'span 2' }} className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(0)}>
                                                <img src={images[0]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(1)}>
                                                <img src={images[1]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(2)}>
                                                <img src={images[2]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="overflow-hidden cursor-zoom-in" onClick={() => setLightboxIndex(3)}>
                                                <img src={images[3]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                            </div>
                                            <div className="relative overflow-hidden cursor-pointer" onClick={() => setLightboxIndex(4)}>
                                                <img src={images[4]} className="w-full h-full object-cover hover:scale-105 transition-transform duration-500" />
                                                <div className="absolute inset-0 bg-black/40 flex items-center justify-center hover:bg-black/50 transition-colors">
                                                    <span className="text-white font-bold text-sm tracking-widest uppercase">Ver todas ({images.length})</span>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </>
                        )}
                    </div>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 md:gap-12 lg:gap-16">

                        <div className="lg:col-span-2">
                            <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-3">
                                <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                    {property.title}
                                </h2>
                                <div className="umbralsuites-badge-black px-5 py-2 rounded-lg text-xs w-fit flex items-center gap-2">
                                    {property.type}
                                </div>
                            </div>

                            <div className="flex flex-wrap items-center gap-6 mb-12">
                                <div className="flex items-center gap-2 text-black">
                                    <MapPin size={18} />
                                    <span className="font-semibold text-sm">{property.location}</span>
                                </div>
                                <div className="flex items-center gap-1">
                                    <div className="flex items-center gap-0.5">
                                        {[...Array(5)].map((_, i) => (
                                            <Star
                                                key={i}
                                                size={16}
                                                className={`${i < Math.round(property.rating) ? 'text-[#FFC107] fill-[#FFC107]' : 'text-gray-200 fill-gray-200'}`}
                                            />
                                        ))}
                                    </div>
                                    <span className="font-bold text-black text-sm ml-2">{property.rating}</span>
                                    <span className="text-black/60 text-sm">({property.reviews} reseñas)</span>
                                </div>
                                <span className="umbralsuites-badge bg-minimal-olive text-white px-4 py-1.5 rounded-lg text-[11px] font-bold">
                                    {property.status}
                                </span>
                            </div>

                            <div className="grid grid-cols-3 gap-4 mb-12 pt-8 border-t border-gray-100">
                                <div className="flex items-center gap-4">
                                    <div className="umbralsuites-icon-bg p-3 bg-gray-50 rounded-xl">
                                        <Bed size={22} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-black leading-none mb-1">{property.beds}</p>
                                        <p className="text-[11px] text-black font-extrabold uppercase tracking-tight">Habitaciones</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                                    <div className="umbralsuites-icon-bg p-3 bg-gray-50 rounded-xl">
                                        <Bath size={22} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-black leading-none mb-1">{property.baths}</p>
                                        <p className="text-[11px] text-black font-extrabold uppercase tracking-tight">Baños</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                                    <div className="umbralsuites-icon-bg p-3 bg-gray-50 rounded-xl">
                                        <Square size={22} className="text-gray-700" />
                                    </div>
                                    <div>
                                        <p className="text-xl font-bold text-black leading-none mb-1">{property.area}</p>
                                        <p className="text-[11px] text-black font-extrabold uppercase tracking-tight">Área</p>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Descripción</h3>
                                <p className="umbralsuites-p-muted text-lg leading-relaxed">
                                    {property.description || "Contáctanos para más detalles sobre esta propiedad."}
                                </p>
                            </div>

                            {property.amenities && (
                                <div className="mb-12">
                                    <h3 className="text-2xl font-bold text-gray-900 mb-6">Comodidades</h3>
                                    <div className="flex flex-wrap gap-3">
                                        {property.amenities.split(',').filter((i: string) => i.trim()).map((item: string) => (
                                            <div key={item} className="flex items-center gap-2.5 px-5 py-3.5 bg-white border border-gray-200 hover:border-minimal-olive transition-colors rounded-2xl shadow-sm cursor-default">
                                                {getAmenityIcon(item)}
                                                <span className="font-semibold tracking-tight text-sm text-gray-700">{item.trim()}</span>
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="mb-12">
                                <h3 className="text-2xl font-bold text-gray-900 mb-6">Ubicación</h3>
                                <div className="w-full h-[400px] rounded-[2rem] overflow-hidden shadow-sm border border-gray-100">
                                    <iframe 
                                        width="100%" 
                                        height="100%" 
                                        frameBorder="0" 
                                        scrolling="no" 
                                        marginHeight={0} 
                                        marginWidth={0} 
                                        src={`https://maps.google.com/maps?q=${encodeURIComponent(property.location || 'Lima, Peru')}&t=&z=15&ie=UTF8&iwloc=&output=embed`}
                                        title="Google Maps Ubicación"
                                    ></iframe>
                                </div>
                            </div>

                            <div className="mt-20">
                                <h3 className="text-3xl font-black text-black tracking-tighter mb-10">Cómo funciona</h3>
                                <div className="flex flex-wrap gap-4 justify-center md:justify-start">
                                    {[
                                        {
                                            icon: <CheckCircle2 className="text-orie-yellow" size={20} />,
                                            title: "Encuentra tu lugar",
                                            desc: "Explora y elige la casa que mejor se adapte a tu estilo.",
                                            bgColor: "bg-orie-yellow/10"
                                        },
                                        {
                                            icon: <ClipboardList className="text-orie-green" size={20} />,
                                            title: "Solicita en línea",
                                            desc: "Envía una solicitud de alquiler y realiza un pago.",
                                            bgColor: "bg-orie-green/10"
                                        },
                                        {
                                            icon: <FileText className="text-orie-blue" size={20} />,
                                            title: "Obtén detalles finales",
                                            desc: "Podrás revisar y firmar el contrato oficial.",
                                            bgColor: "bg-orie-blue/10"
                                        },
                                        {
                                            icon: <Users className="text-orie-red" size={18} />,
                                            title: "Únete a la comunidad",
                                            desc: "Vivirás en un vecindario seguro.",
                                            bgColor: "bg-orie-red/10"
                                        }
                                    ].map((item, i) => (
                                        <div key={i} className="bg-white p-5 rounded-3xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow flex flex-col items-center text-center group w-full max-w-[160px]">
                                            <div className={`w-10 h-10 ${item.bgColor} rounded-full flex items-center justify-center mb-3 group-hover:scale-110 transition-transform`}>
                                                {item.icon}
                                            </div>
                                            <h4 className="text-[11px] font-black text-black mb-1.5 uppercase tracking-tighter leading-tight">{item.title}</h4>
                                            <p className="text-[9px] text-black font-bold leading-tight">{item.desc}</p>
                                        </div>
                                    ))}
                                </div>
                            </div>

                            <div className="mt-20">
                                <h3 className="text-3xl font-black text-black tracking-tighter mb-10">Tipos de alojamiento</h3>
                                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                                    {allProperties
                                        .filter(p => (p.location === property.location || p.type === property.type) && p.id !== property.id)
                                        .slice(0, 8)
                                        .map((p, i) => (
                                            <div
                                                key={p.id}
                                                onClick={() => onSelectProperty?.(p)}
                                                className="snap-start shrink-0 w-[280px] md:w-[400px] relative group cursor-pointer overflow-hidden rounded-[2rem] bg-white border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500"
                                            >
                                                <div className="aspect-[16/10] overflow-hidden relative">
                                                    <img src={p.img} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" alt={p.title} />
                                                    <div className="absolute top-4 left-4 flex gap-2">
                                                        <span className="bg-white/95 px-3 py-1.5 rounded-full text-[10px] font-black uppercase tracking-widest text-black shadow-sm">
                                                            {p.type}
                                                        </span>
                                                    </div>
                                                </div>
                                                <div className={`p-6 transition-colors ${i === 0 ? 'bg-orie-yellow/10' : ''}`}>
                                                    <div className="flex justify-between items-start mb-3">
                                                        <h4 className="text-base font-black text-black leading-tight">{p.title}</h4>
                                                        <div className="flex items-center gap-1 shrink-0">
                                                            <Star size={12} className="text-[#FFC107] fill-[#FFC107]" />
                                                            <span className="text-xs font-bold text-black">{p.rating}</span>
                                                        </div>
                                                    </div>
                                                    <div className="flex items-center gap-4 text-gray-400 text-[10px] font-bold mb-4">
                                                        <span className="flex items-center gap-2"><Bed size={14} /> {p.beds} hab.</span>
                                                        <span className="flex items-center gap-2"><Square size={14} /> {p.area}</span>
                                                    </div>
                                                    <div className="flex justify-between items-center border-t border-gray-100 pt-4">
                                                        <div>
                                                            <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest leading-none mb-1">Desde</p>
                                                            <span className="text-lg font-black text-black">S/{p.discounted_price || p.price}</span>
                                                        </div>
                                                        <button
                                                            onClick={(e) => { e.stopPropagation(); onSelectProperty?.(p); }}
                                                            className="bg-black text-white p-2.5 rounded-xl hover:bg-orie-yellow hover:text-black transition-all"
                                                        >
                                                            <ChevronRight size={18} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>

                            <div className="mt-20">
                                <div className="flex justify-between items-end mb-10">
                                    <div>
                                        <h3 className="text-3xl font-black text-black tracking-tighter mb-2">Descubre nuestras propiedades</h3>
                                        <p className="text-gray-500 font-medium">Otros lugares premium.</p>
                                    </div>
                                </div>
                                <div className="flex gap-6 overflow-x-auto pb-6 scrollbar-hide snap-x snap-mandatory -mx-4 px-4 md:mx-0 md:px-0">
                                    {allProperties
                                        .filter(p => p.id !== property.id)
                                        .slice(0, 8)
                                        .map((p) => (
                                            <div
                                                key={p.id}
                                                onClick={() => onSelectProperty?.(p)}
                                                className="snap-start shrink-0 w-[260px] md:w-[320px] group cursor-pointer flex gap-4 p-4 bg-white rounded-3xl border border-gray-50 hover:border-gray-200 transition-all shadow-sm hover:shadow-md"
                                            >
                                                <div className="w-24 h-24 rounded-2xl overflow-hidden shrink-0">
                                                    <img src={p.img} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={p.title} />
                                                </div>
                                                <div className="flex flex-col justify-center min-w-0">
                                                    <h4 className="text-sm font-black text-black mb-1 truncate">{p.title}</h4>
                                                    <div className="flex items-center gap-1 mb-2">
                                                        <Star size={10} className="text-[#FFC107] fill-[#FFC107]" />
                                                        <span className="text-[10px] font-bold text-black">{p.rating}</span>
                                                    </div>
                                                    <p className="text-xs font-black text-black">S/{p.discounted_price || p.price}</p>
                                                </div>
                                            </div>
                                        ))}
                                </div>
                            </div>
                        </div>

                        <div className="lg:sticky lg:top-32 h-fit mb-12 lg:mb-0">
                            <div className="bg-white border border-black rounded-2xl p-6 lg:p-7 shadow-sm">
                                <div className="flex flex-col gap-2 mb-6">
                                    {property.discounted_price && Number(property.discounted_price) > 0 ? (
                                        <>
                                            <div className="flex items-center gap-2">
                                                <span className="text-2xl text-gray-400 font-bold line-through">S/{Number(property.price).toFixed(2)}</span>
                                            </div>
                                            <div className="flex items-end gap-2">
                                                <span className="text-4xl font-black text-black">S/{Number(property.discounted_price).toFixed(2)}</span>
                                                <span className="text-sm font-black text-white bg-red-500 px-2.5 py-1 rounded-lg">Desc. -{(((Number(property.price) - Number(property.discounted_price)) / Number(property.price)) * 100).toFixed(0)}%</span>
                                            </div>
                                        </>
                                    ) : (
                                    <span className="text-3xl sm:text-4xl font-black text-black">S/{Number(property.price).toFixed(2)}</span>
                                    )}
                                    <span className="text-black font-bold text-xs sm:text-sm">por mes</span>
                                </div>

                                <div className="w-full h-px bg-gray-100 mb-6"></div>

                                <form className="space-y-3 sm:space-y-4">
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Nombre</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={firstName}
                                                    onChange={(e) => {
                                                        setFirstName(e.target.value);
                                                        if (errors.firstName) setErrors(prev => ({ ...prev, firstName: undefined }));
                                                    }}
                                                    placeholder="Nombre"
                                                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border ${errors.firstName ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all`}
                                                />
                                                {errors.firstName && <span className="text-[9px] text-red-500 font-bold mt-1 block">Obligatorio</span>}
                                            </div>
                                        </div>
 
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Apellidos</label>
                                            <div className="relative group">
                                                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                                <input
                                                    type="text"
                                                    value={lastName}
                                                    onChange={(e) => {
                                                        setLastName(e.target.value);
                                                        if (errors.lastName) setErrors(prev => ({ ...prev, lastName: undefined }));
                                                    }}
                                                    placeholder="Apellidos"
                                                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border ${errors.lastName ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all`}
                                                />
                                                {errors.lastName && <span className="text-[9px] text-red-500 font-bold mt-1 block">Obligatorio</span>}
                                            </div>
                                        </div>
                                    </div>
 
                                    <div className="grid grid-cols-1 gap-3 sm:gap-4">
                                        <div className="flex flex-col gap-1.5">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Email</label>
                                            <div className="relative group">
                                                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                                <input
                                                    type="email"
                                                    value={email}
                                                    onChange={(e) => {
                                                        setEmail(e.target.value);
                                                        if (errors.email) setErrors(prev => ({ ...prev, email: undefined }));
                                                    }}
                                                    placeholder="Correo electrónico"
                                                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border ${errors.email ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all`}
                                                />
                                                {errors.email && <span className="text-[9px] text-red-500 font-bold mt-1 block">Obligatorio</span>}
                                            </div>
                                        </div>
                                    </div>
 
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Celular</label>
                                            <div className="relative group">
                                                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                                <input
                                                    type="tel"
                                                    value={phone}
                                                    onChange={(e) => {
                                                        setPhone(e.target.value);
                                                        if (errors.phone) setErrors(prev => ({ ...prev, phone: undefined }));
                                                    }}
                                                    placeholder="Celular"
                                                    className={`w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border ${errors.phone ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all`}
                                                />
                                                {errors.phone && <span className="text-[9px] text-red-500 font-bold mt-1 block">Obligatorio</span>}
                                            </div>
                                        </div>
 
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Huéspedes</label>
                                            <div className="relative group">
                                                <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={18} />
                                                <input
                                                    type="number"
                                                    min={1}
                                                    value={guests}
                                                    onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                                    onWheel={(e) => (e.target as any).blur()}
                                                    className="w-full pl-10 pr-4 py-3.5 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                                />
                                            </div>
                                        </div>
                                    </div>
 
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4">
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Fecha de ingreso</label>
                                            <div className="relative group">
                                                <input
                                                    type="date"
                                                    min={today}
                                                    value={checkIn}
                                                    onChange={(e) => {
                                                        setCheckIn(e.target.value);
                                                        if (errors.checkIn) setErrors(prev => ({ ...prev, checkIn: undefined }));
                                                    }}
                                                    className={`w-full px-4 py-3.5 bg-gray-50/50 border ${errors.checkIn ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer`}
                                                />
                                                {errors.checkIn && <span className="text-[9px] text-red-500 font-bold mt-1 block">{errors.checkIn === "Campo obligatorio" ? "Obligatorio" : errors.checkIn}</span>}
                                            </div>
                                        </div>
                                        <div className="flex flex-col gap-2">
                                            <label className="text-[10px] sm:text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Fecha de salida</label>
                                            <div className="relative group">
                                                <input
                                                    type="date"
                                                    min={checkIn || today}
                                                    value={checkOut}
                                                    onChange={(e) => {
                                                        setCheckOut(e.target.value);
                                                        if (errors.checkOut) setErrors(prev => ({ ...prev, checkOut: undefined }));
                                                    }}
                                                    className={`w-full px-4 py-3.5 bg-gray-50/50 border ${errors.checkOut ? 'border-red-500' : 'border-gray-100'} rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer`}
                                                />
                                                {errors.checkOut && <span className="text-[9px] text-red-500 font-bold mt-1 block">{errors.checkOut === "Campo obligatorio" ? "Obligatorio" : errors.checkOut}</span>}
                                            </div>
                                        </div>
                                    </div>

                                    {availableServices.length > 0 && (
                                        <div className="flex flex-col gap-2 mt-1">
                                            <label className="text-[10px] text-gray-400 font-black uppercase tracking-widest pl-1">Servicios Extra (Opcional)</label>
                                            <div className="grid grid-cols-1 gap-1.5 max-h-[180px] lg:max-h-[220px] overflow-y-auto pr-1 customize-scrollbar">
                                                {availableServices.map((service) => (
                                                    <div 
                                                        key={service.id}
                                                        onClick={() => toggleService(service.id as number)}
                                                        className={`flex items-center justify-between p-2 sm:p-2.5 rounded-lg border transition-all cursor-pointer ${
                                                            selectedServiceIds.includes(service.id as number)
                                                                ? 'border-minimal-olive bg-minimal-olive/5 shadow-sm'
                                                                : 'border-gray-50 bg-gray-50/20 hover:border-minimal-olive/20'
                                                        }`}
                                                    >
                                                        <div className="flex items-center gap-2">
                                                            <div className={`w-4 h-4 rounded border flex items-center justify-center transition-colors ${
                                                                selectedServiceIds.includes(service.id as number)
                                                                    ? 'bg-minimal-olive border-minimal-olive text-white'
                                                                    : 'border-gray-300 bg-white'
                                                            }`}>
                                                                {selectedServiceIds.includes(service.id as number) && <Star size={10} fill="currentColor" />}
                                                            </div>
                                                            <div>
                                                                <p className="text-xs font-bold text-black leading-none mb-0.5">{service.name}</p>
                                                                <p className="text-[9px] text-gray-400 font-medium leading-tight">{service.description || 'Consulta detalles con el administrador'}</p>
                                                            </div>
                                                        </div>
                                                        <span className="text-xs font-black text-minimal-olive shrink-0 ml-2">S/ {service.price}</span>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    <button
                                        type="button"
                                        onClick={handleReserve}
                                        className="bg-orie-yellow text-black w-full py-5 text-base font-bold rounded-xl hover:bg-orie-yellow/80 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                    >
                                        Reservar ahora
                                    </button>
                                </form>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Lightbox */}
            {lightboxIndex !== null && (
                <div
                    className="fixed inset-0 z-[3000] bg-black/95 flex items-center justify-center"
                    onClick={() => setLightboxIndex(null)}
                >
                    <button
                        onClick={() => setLightboxIndex(null)}
                        className="absolute top-6 right-6 w-10 h-10 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white transition-colors"
                    >
                        <X size={20} />
                    </button>
                    <div className="absolute top-4 sm:top-6 left-1/2 -translate-x-1/2 text-white/60 text-[10px] sm:text-xs font-bold tracking-widest uppercase">
                        {(lightboxIndex as number) + 1} / {images.length}
                    </div>
                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(l => l !== null ? (l > 0 ? l - 1 : images.length - 1) : 0); }}
                            className="absolute left-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
                        >←</button>
                    )}
                    <img
                        src={images[lightboxIndex as number]}
                        alt={`Foto ${(lightboxIndex as number) + 1}`}
                        className="max-w-[90vw] max-h-[85vh] object-contain rounded-2xl shadow-2xl"
                        onClick={(e) => e.stopPropagation()}
                    />
                    {images.length > 1 && (
                        <button
                            onClick={(e) => { e.stopPropagation(); setLightboxIndex(l => l !== null ? (l < images.length - 1 ? l + 1 : 0) : 0); }}
                            className="absolute right-6 w-12 h-12 rounded-full bg-white/10 hover:bg-white/20 flex items-center justify-center text-white text-xl transition-colors"
                        >→</button>
                    )}
                    {images.length > 1 && (
                        <div className="absolute bottom-6 left-1/2 -translate-x-1/2 flex gap-2">
                            {images.map((img, i) => (
                                <button
                                    key={i}
                                    onClick={(e) => { e.stopPropagation(); setLightboxIndex(i); }}
                                    className={`w-12 h-12 rounded-lg overflow-hidden border-2 transition-all ${lightboxIndex === i ? 'border-white scale-110' : 'border-white/20 opacity-50 hover:opacity-80'}`}
                                >
                                    <img src={img} className="w-full h-full object-cover" />
                                </button>
                            ))}
                        </div>
                    )}
                </div>
            )}

            <AuthModal 
                isOpen={isAuthModalOpen} 
                onClose={() => setIsAuthModalOpen(false)}
                initialMode="register"
                onSuccess={() => {
                    // After successful login/register, the useEffect will trigger 
                    // and populate the fields. The user can then click reserve again.
                    setIsAuthModalOpen(false);
                }}
            />

            {/* Premium Toast Notification */}
            {showNotification && (
                <div className="fixed top-10 left-1/2 -translate-x-1/2 z-[6000] animate-in fade-in slide-in-from-top-10 duration-500">
                    <div className="bg-black/90 backdrop-blur-xl border border-white/20 text-white px-8 py-5 rounded-2xl shadow-2xl flex items-center gap-4 min-w-[320px] max-w-md">
                        <div className="w-8 h-8 bg-minimal-olive rounded-xl flex items-center justify-center shrink-0">
                            <Info size={18} className="text-white" />
                        </div>
                        <div>
                            <p className="text-xs font-black uppercase tracking-widest text-minimal-olive mb-1">Aviso</p>
                            <p className="text-sm font-bold leading-tight">{showNotification.message}</p>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
};

export default PropertyDetails;
