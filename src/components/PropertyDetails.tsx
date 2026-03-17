import { useState } from 'react';
import { X, Bed, Bath, Square, MapPin, Star, CheckCircle2, Calendar, Users } from 'lucide-react';

interface PropertyDetailsProps {
    property: any;
    onClose: () => void;
}

const PropertyDetails: React.FC<PropertyDetailsProps> = ({ property, onClose }) => {
    const [checkIn, setCheckIn] = useState('');
    const [checkOut, setCheckOut] = useState('');
    const [guests, setGuests] = useState(1);

    const handleReserve = () => {
        const phoneNumber = "+51968231620";
        const message = `Hola, buen día. Deseo realizar una reserva en Umbral Suite.

Tipo de habitación: ${property.title}.

Fecha de ingreso (Check-in): ${checkIn || '[Insertar Fecha]'}

Fecha de salida (Check-out): ${checkOut || '[Insertar Fecha]'}

Cantidad de personas: ${guests}

Quedo atento a su confirmación de disponibilidad y a los pasos para garantizar la reserva. ¡Muchas gracias!`;
        const whatsappUrl = `https://wa.me/${phoneNumber.replace('+', '')}?text=${encodeURIComponent(message)}`;
        window.open(whatsappUrl, '_blank');
    };

    return (
        <div className="fixed inset-0 z-[2000] bg-minimal-beige overflow-y-auto font-inter">

            <div className="sticky top-0 z-50 bg-white/90 backdrop-blur-md flex justify-between items-center px-8 md:px-12 py-6 border-b border-black">
                <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-black rounded flex items-center justify-center text-white font-bold">H</div>
                    <span className="text-black font-bold text-xl tracking-tighter">Homad</span>
                </div>
                <button
                    onClick={onClose}
                    className="flex items-center gap-2 text-black font-bold text-sm hover:opacity-70 transition-opacity"
                >
                    <X size={20} /> Cerrar
                </button>
            </div>

            <div className="max-w-7xl mx-auto pb-20 px-6 md:px-12">

                <div className="w-full h-[40vh] md:h-[60vh] rounded-[2rem] md:rounded-[2.5rem] overflow-hidden mb-12 shadow-sm border border-gray-100">
                    <img
                        src={property.img}
                        className="w-full h-full object-cover"
                        alt={property.title}
                    />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">

                    <div className="lg:col-span-2">
                        <div className="flex flex-col md:flex-row md:justify-between md:items-center gap-4 mb-3">
                            <h2 className="text-4xl md:text-5xl font-black text-gray-900 tracking-tighter">
                                {property.title}
                            </h2>
                            <span className="homad-badge-black px-5 py-2 rounded-lg text-xs w-fit">
                                {property.type}
                            </span>
                        </div>

                        <div className="flex flex-wrap items-center gap-6 mb-12">
                            <div className="flex items-center gap-2 text-gray-500">
                                <MapPin size={18} />
                                <span className="font-semibold text-sm">{property.location}</span>
                            </div>
                            <div className="flex items-center gap-2">
                                <Star size={18} className="text-orie-yellow fill-orie-yellow" />
                                <span className="font-bold text-gray-900 text-sm">{property.rating}</span>
                                <span className="text-gray-400 text-sm">({property.reviews} reseñas)</span>
                            </div>
                            <span className="homad-badge bg-orie-green text-white px-4 py-1.5 rounded-lg text-[11px] font-bold">
                                {property.status}
                            </span>
                        </div>

                        <div className="grid grid-cols-3 gap-4 mb-12 pt-8 border-t border-gray-100">
                            <div className="flex items-center gap-4">
                                <div className="homad-icon-bg p-3 bg-gray-50 rounded-xl">
                                    <Bed size={22} className="text-gray-700" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{property.beds}</p>
                                    <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-tight">Habitaciones</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                                <div className="homad-icon-bg p-3 bg-gray-50 rounded-xl">
                                    <Bath size={22} className="text-gray-700" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{property.baths}</p>
                                    <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-tight">Baños</p>
                                </div>
                            </div>
                            <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
                                <div className="homad-icon-bg p-3 bg-gray-50 rounded-xl">
                                    <Square size={22} className="text-gray-700" />
                                </div>
                                <div>
                                    <p className="text-xl font-bold text-gray-900 leading-none mb-1">{property.area}</p>
                                    <p className="text-[11px] text-gray-400 font-extrabold uppercase tracking-tight">Área</p>
                                </div>
                            </div>
                        </div>


                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Descripción</h3>
                            <p className="homad-p-muted text-lg leading-relaxed">
                                Estudio moderno con vistas espectaculares al mar. Edificio con amenidades de lujo,
                                ubicado en una de las zonas más exclusivas y tranquilas. Ideal para ejecutivos o
                                parejas que buscan comodidad y diseño vanguardista.
                            </p>
                        </div>


                        <div className="mb-12">
                            <h3 className="text-2xl font-bold text-gray-900 mb-6">Comodidades</h3>
                            <div className="grid grid-cols-2 gap-y-5">
                                {["WiFi de alta velocidad", "Gimnasio completo", "Seguridad 24/7", "Vista panorámica", "Piscina climatizada"].map((item) => (
                                    <div key={item} className="flex items-center gap-3 text-gray-600">
                                        <CheckCircle2 size={22} className="text-orie-green" />
                                        <span className="font-semibold text-lg">{item}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    <div className="lg:sticky lg:top-32 h-fit">
                        <div className="bg-white border border-black rounded-2xl p-8">
                            <div className="flex flex-col gap-1 mb-6">
                                <span className="text-4xl font-black text-gray-900">{property.price}</span>
                                <span className="text-gray-400 font-bold text-sm">por mes</span>
                            </div>

                            <div className="w-full h-px bg-gray-100 mb-8"></div>

                            <form className="space-y-6">
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Fecha de ingreso</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                                            <input
                                                type="date"
                                                value={checkIn}
                                                onChange={(e) => setCheckIn(e.target.value)}
                                                className="w-full pl-10 pr-2 py-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Fecha de salida</label>
                                        <div className="relative group">
                                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={16} />
                                            <input
                                                type="date"
                                                value={checkOut}
                                                onChange={(e) => setCheckOut(e.target.value)}
                                                className="w-full pl-10 pr-2 py-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all cursor-pointer"
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[11px] text-gray-400 font-black uppercase tracking-widest pl-1">Huéspedes</label>
                                    <div className="relative group">
                                        <Users className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-black transition-colors" size={20} />
                                        <input
                                            type="number"
                                            min={1}
                                            value={guests}
                                            onChange={(e) => setGuests(parseInt(e.target.value) || 1)}
                                            className="w-full pl-12 pr-6 py-4 bg-gray-50/50 border border-gray-100 rounded-xl text-sm font-bold focus:bg-white focus:ring-2 focus:ring-black/5 outline-none transition-all"
                                        />
                                    </div>
                                </div>

                                <button
                                    type="button"
                                    onClick={handleReserve}
                                    className="bg-orie-yellow text-black w-full py-5 text-base font-bold rounded-xl hover:bg-orie-yellow/80 transition-all active:scale-[0.98] flex items-center justify-center gap-2 mt-2"
                                >
                                    Reservar ahora
                                </button>

                                <p className="text-[10px] text-gray-400 text-center font-bold uppercase tracking-widest">
                                    No se realizará ningún cargo aún
                                </p>
                            </form>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PropertyDetails;
