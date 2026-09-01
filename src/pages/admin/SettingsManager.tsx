import { useEffect, useState } from 'react';
import { settingsService } from '../../services/crudService';
import { Loader2, Smartphone, Save, CheckCircle2, AlertCircle, X, Settings2, ShieldCheck, Globe, Truck, Package, CreditCard, RotateCcw, BadgePercent, Eye, FileText, Info } from 'lucide-react';

type ReservationPolicy = {
    icon: string;
    text: string;
};

// Políticas de compra para e-commerce
const defaultReservationPolicies: ReservationPolicy[] = [
    { icon: 'truck', text: 'Los envíos se realizan de 2 a 5 días hábiles en todo el país. El costo se calcula según tu ubicación.' },
    { icon: 'credit-card', text: 'Aceptamos tarjetas de crédito, débito, transferencias y pagos contra entrega en zonas seleccionadas.' },
    { icon: 'package', text: 'Una vez confirmado el pago, el pedido se procesa en un máximo de 24 horas. Recibirás un código de seguimiento.' },
    { icon: 'rotatte-ccw', text: 'No se realizan devoluciones de dinero en efectivo; se emitirá un cupón de compra por el mismo valor.' },
    { icon: 'badge-percent', text: 'Todos los productos cuentan con garantía. Si llegas a recibir un producto defectuoso, tienes 7 días para solicitar el cambio.' },
];

const iconOptions = [
    { value: 'truck', label: 'Envío / Transporte' },
    { value: 'credit-card', label: 'Pago / Tarjeta' },
    { value: 'package', label: 'Paquete / Pedido' },
    { value: 'rotatte-ccw', label: 'Devolución / Cambio' },
    { value: 'badge-percent', label: 'Garantía / Promoción' },
    { value: 'shield', label: 'Seguridad' },
    { value: 'info', label: 'Información' }
];

const SettingsManager = () => {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const [reservationPolicies, setReservationPolicies] = useState<ReservationPolicy[]>(defaultReservationPolicies);
    const [isEditingPolicies, setIsEditingPolicies] = useState(false);
    const [savingPolicies, setSavingPolicies] = useState(false);
    const [showPoliciesPreview, setShowPoliciesPreview] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const renderPolicyIcon = (icon: string, size = 20) => {
        switch (icon) {
            case 'truck':
                return <Truck size={size} className="text-black" />;
            case 'credit-card':
                return <CreditCard size={size} className="text-black" />;
            case 'package':
                return <Package size={size} className="text-black" />;
            case 'rotatte-ccw':
                return <RotateCcw size={size} className="text-black" />;
            case 'badge-percent':
                return <BadgePercent size={size} className="text-black" />;
            case 'shield':
                return <ShieldCheck size={size} className="text-black" />;
            case 'info':
                return <Info size={size} className="text-black" />;
            default:
                return <Info size={size} className="text-black" />;
        }
    };

    const loadSettings = async () => {
        try {
            setLoading(true);

            const response = await settingsService.getAll();
            const data = response.data.data || {};

            setSettings(data);
            setInputValue(data.whatsapp_number || '');

            if (data.reservation_policies) {
                const parsedPolicies =
                    typeof data.reservation_policies === 'string'
                        ? JSON.parse(data.reservation_policies)
                        : data.reservation_policies;

                if (Array.isArray(parsedPolicies)) {
                    const normalizedPolicies = parsedPolicies.map((item: any, index: number) => {
                        if (typeof item === 'string') {
                            return {
                                icon: defaultReservationPolicies[index]?.icon || 'info',
                                text: item
                            };
                        }

                        return {
                            icon: item.icon || defaultReservationPolicies[index]?.icon || 'info',
                            text: item.text || ''
                        };
                    });

                    setReservationPolicies(normalizedPolicies);
                } else {
                    setReservationPolicies(defaultReservationPolicies);
                }
            } else {
                setReservationPolicies(defaultReservationPolicies);
            }

        } catch (err) {
            console.error('Error loading settings:', err);
            setMessage({
                type: 'error',
                text: 'Error al conectar con el servidor.'
            });

            setReservationPolicies(defaultReservationPolicies);

        } finally {
            setLoading(false);
        }
    };

    const handleSave = async () => {
        if (!inputValue.trim()) {
            setMessage({ type: 'error', text: 'El número no puede estar vacío.' });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);
            const cleanValue = inputValue.replace(/[^0-9]/g, '');

            await settingsService.update('whatsapp_number', cleanValue);

            setSettings(prev => ({ ...prev, whatsapp_number: cleanValue }));
            setInputValue(cleanValue);
            setIsEditing(false);
            setMessage({ type: 'success', text: 'Configuración guardada exitosamente.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving setting:', err);
            if (err.response) {
                console.error('Data:', err.response.data);
                console.error('Status:', err.response.status);
            }
            setMessage({ type: 'error', text: `Error al guardar: ${err.response?.status || 'desconocido'}` });
        } finally {
            setSaving(false);
        }
    };

    const handleSavePolicies = async () => {
        const cleanPolicies = reservationPolicies.map(policy => ({
            icon: policy.icon,
            text: policy.text.trim()
        }));

        const hasEmptyPolicy = cleanPolicies.some(policy => !policy.text);

        if (hasEmptyPolicy) {
            setMessage({
                type: 'error',
                text: 'Todas las políticas deben tener texto.'
            });
            return;
        }

        try {
            setSavingPolicies(true);
            setMessage(null);

            await settingsService.update('reservation_policies', JSON.stringify(cleanPolicies));

            setSettings(prev => ({
                ...prev,
                reservation_policies: JSON.stringify(cleanPolicies)
            }));

            setReservationPolicies(cleanPolicies);
            setIsEditingPolicies(false);

            setMessage({
                type: 'success',
                text: 'Políticas guardadas correctamente.'
            });

            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving reservation policies:', err);
            setMessage({
                type: 'error',
                text: `Error al guardar políticas: ${err.response?.status || 'desconocido'}`
            });
        } finally {
            setSavingPolicies(false);
        }
    };

    const handleCancel = () => {
        setInputValue(settings.whatsapp_number || '');
        setIsEditing(false);
        setMessage(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-minimal-olive/20 border-t-minimal-olive rounded-full animate-spin"></div>
                    <Settings2 className="absolute inset-0 m-auto text-minimal-olive animate-pulse" size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto lg:max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-minimal-olive/10 rounded-2xl flex items-center justify-center text-minimal-olive border border-minimal-olive/20 flex-shrink-0">
                    <Settings2 size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-black text-black uppercase tracking-widest leading-none mb-1">Ajustes del Sitio</h2>
                    <p className="text-[10px] text-gray-400 font-bold uppercase tracking-tighter">Gestiona la información global de contacto</p>
                </div>
            </div>

            {/* Main Card */}
            <div className="bg-white rounded-[2rem] border border-gray-100 shadow-xl shadow-black/[0.02] overflow-hidden relative group transition-all hover:shadow-2xl hover:shadow-black/[0.04]">
                {/* Decorative background element - Hidden on mobile if needed, or scaled */}
                <div className="absolute top-0 right-0 p-8 opacity-[0.03] group-hover:opacity-[0.05] transition-opacity pointer-events-none hidden sm:block">
                    <Globe size={120} className="rotate-12" />
                </div>

                <div className="p-5 sm:p-8 space-y-6 sm:space-y-8 relative z-10">
                    {/* Setting Item */}
                    <div className="space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-minimal-olive/10 transition-colors flex-shrink-0">
                                    <Smartphone size={16} className="text-gray-400 group-hover:text-minimal-olive transition-colors" />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest truncate">Número de WhatsApp</span>
                            </div>

                            {!isEditing && (
                                <button
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 sm:px-4 py-1.5 bg-minimal-olive/5 hover:bg-minimal-olive/10 text-minimal-olive rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                                >
                                    Editar
                                </button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4 animate-in fade-in slide-in-from-top-2 duration-300">
                                <div className="flex flex-col sm:flex-row gap-2">
                                    <div className="relative flex-1 group/input">
                                        <input
                                            type="text"
                                            value={inputValue}
                                            onChange={(e) => setInputValue(e.target.value)}
                                            className="w-full pl-4 pr-4 py-3 sm:py-4 bg-gray-50 border-2 border-transparent rounded-2xl sm:rounded-[1.25rem] text-sm font-black text-black placeholder:text-gray-300 focus:bg-white focus:border-minimal-olive outline-none transition-all"
                                            placeholder="Ej: 51968231620"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 sm:flex-none h-12 uppercase sm:h-auto sm:w-12 sm:aspect-square bg-black text-white rounded-2xl flex items-center justify-center hover:bg-minimal-olive transition-all disabled:opacity-50 text-[10px] font-black tracking-widest sm:text-base"
                                        >
                                            {saving ? <Loader2 size={16} className="animate-spin" /> : (
                                                <>
                                                    <Save size={16} className="sm:block hidden" />
                                                    <span className="sm:hidden">Guardar</span>
                                                </>
                                            )}
                                        </button>
                                        <button
                                            onClick={handleCancel}
                                            className="h-12 w-12 sm:w-12 sm:aspect-square text-gray-400 hover:text-black hover:bg-gray-100 rounded-2xl flex items-center justify-center transition-all bg-gray-50 sm:bg-transparent"
                                        >
                                            <X size={16} />
                                        </button>
                                    </div>
                                </div>
                                <div className="flex items-start gap-2 text-[9px] sm:text-[10px] text-gray-400 italic font-medium px-2">
                                    <AlertCircle size={12} className="shrink-0 mt-0.5" />
                                    <span>Formato internacional sin símbolos (+, - , espacios). Ejemplo: 51900000000</span>
                                </div>
                            </div>
                        ) : (
                            <div className="flex flex-col sm:flex-row sm:items-end justify-between p-5 sm:p-6 bg-gray-50 rounded-2xl sm:rounded-[1.5rem] border border-black/[0.02] gap-4">
                                <div className="space-y-1">
                                    <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Configurado como</p>
                                    <span className="text-2xl sm:text-3xl font-black text-black tracking-tighter leading-none break-all">
                                        {settings.whatsapp_number ? `+${settings.whatsapp_number}` : (
                                            <span className="text-red-400">No configurado</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${settings.whatsapp_number ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600' : 'bg-red-500/10 border-red-500/20 text-red-600'}`}>
                                        <div className={`w-1.5 h-1.5 rounded-full animate-pulse ${settings.whatsapp_number ? 'bg-emerald-500' : 'bg-red-500'}`} />
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {settings.whatsapp_number ? 'Sincronizado' : 'No Sincronizado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                    {/* Políticas de compra */}
                    <div className="pt-6 border-t border-gray-100 space-y-4">
                        <div className="flex items-center justify-between gap-4">
                            <div className="flex items-center gap-2">
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-minimal-olive/10 transition-colors flex-shrink-0">
                                    <FileText size={16} className="text-gray-400 group-hover:text-minimal-olive transition-colors" />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest truncate">
                                    Políticas de compra
                                </span>
                            </div>

                            <div className="flex items-center gap-2">
                                <button
                                    type="button"
                                    onClick={() => setShowPoliciesPreview(true)}
                                    className="px-3 sm:px-4 py-1.5 bg-black text-white rounded-full text-[10px] font-black uppercase tracking-widest hover:bg-minimal-olive transition-all whitespace-nowrap flex items-center gap-1.5"
                                >
                                    <Eye size={12} />
                                    Vista previa
                                </button>

                                {!isEditingPolicies && (
                                    <button
                                        type="button"
                                        onClick={() => setIsEditingPolicies(true)}
                                        className="px-3 sm:px-4 py-1.5 bg-minimal-olive/5 hover:bg-minimal-olive/10 text-minimal-olive rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>
                        </div>

                        {isEditingPolicies ? (
                            <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                {reservationPolicies.map((policy, index) => (
                                    <div
                                        key={index}
                                        className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3"
                                    >
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 bg-white rounded-xl border border-gray-100 flex items-center justify-center shrink-0">
                                                {renderPolicyIcon(policy.icon, 20)}
                                            </div>

                                            <div className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                                                <span className="text-xs font-black text-black">
                                                    {index + 1}
                                                </span>
                                            </div>

                                            <select
                                                value={policy.icon}
                                                onChange={(e) => {
                                                    const updatedPolicies = [...reservationPolicies];
                                                    updatedPolicies[index].icon = e.target.value;
                                                    setReservationPolicies(updatedPolicies);
                                                }}
                                                className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 text-xs font-bold text-black outline-none focus:border-minimal-olive"
                                            >
                                                {iconOptions.map(option => (
                                                    <option key={option.value} value={option.value}>
                                                        {option.label}
                                                    </option>
                                                ))}
                                            </select>
                                        </div>

                                        <textarea
                                            value={policy.text}
                                            onChange={(e) => {
                                                const updatedPolicies = [...reservationPolicies];
                                                updatedPolicies[index].text = e.target.value;
                                                setReservationPolicies(updatedPolicies);
                                            }}
                                            rows={2}
                                            className="w-full px-4 py-3 bg-white rounded-xl border border-gray-100 text-xs font-bold text-black outline-none focus:border-minimal-olive resize-none"
                                            placeholder={`Política ${index + 1}`}
                                        />
                                    </div>
                                ))}

                                <div className="flex flex-col sm:flex-row gap-2 pt-2">
                                    <button
                                        type="button"
                                        onClick={handleSavePolicies}
                                        disabled={savingPolicies}
                                        className="flex-1 bg-black text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {savingPolicies ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                        Guardar políticas
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => setShowPoliciesPreview(true)}
                                        className="flex-1 bg-minimal-olive/10 text-minimal-olive py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive hover:text-white transition-all flex items-center justify-center gap-2"
                                    >
                                        <Eye size={14} />
                                        Vista previa
                                    </button>

                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingPolicies(false);
                                            loadSettings();
                                        }}
                                        className="flex-1 bg-gray-50 text-gray-500 py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-gray-100 transition-all"
                                    >
                                        Cancelar
                                    </button>
                                </div>
                            </div>
                        ) : (
                            <div className="bg-gray-50 rounded-2xl p-5 border border-black/[0.02] space-y-3">
                                {reservationPolicies.map((policy, index) => (
                                    <div
                                        key={index}
                                        className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100"
                                    >
                                        <div className="w-9 h-9 rounded-full bg-gray-50 border border-gray-100 flex items-center justify-center shrink-0">
                                            {renderPolicyIcon(policy.icon, 18)}
                                        </div>

                                        <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                                            <span className="text-[10px] font-black text-black">
                                                {index + 1}
                                            </span>
                                        </div>

                                        <p className="text-xs font-bold text-gray-600 leading-snug line-clamp-2">
                                            {policy.text}
                                        </p>
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>


                    {/* Status Footer */}
                    <div className="pt-6 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-2 text-gray-400">
                            <ShieldCheck size={14} />
                            <span className="text-[9px] sm:text-[10px] font-bold uppercase tracking-widest">Seguridad activada</span>
                        </div>
                        {message && (
                            <div className="animate-in fade-in zoom-in duration-300 flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] sm:text-[10px] font-black uppercase tracking-widest bg-emerald-50 text-emerald-600 border border-emerald-100">
                                {message.type === 'success' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                {message.text}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {showPoliciesPreview && (
                <div className="fixed inset-0 z-[7000] flex items-center justify-center p-4">
                    <div
                        className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                        onClick={() => setShowPoliciesPreview(false)}
                    />

                    <div className="relative bg-white w-full max-w-xl max-h-[86vh] overflow-y-auto rounded-[2rem] shadow-2xl border border-black/10">
                        <div className="px-6 py-5 border-b border-gray-100 flex items-start justify-between gap-4">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-xl bg-white border border-black/10 flex items-center justify-center shadow-sm">
                                    <ShieldCheck size={30} className="text-black" />
                                </div>

                                <div>
                                    <h3 className="text-2xl font-black text-black tracking-tight leading-none">
                                        Políticas de compra
                                    </h3>
                                    <p className="text-sm text-gray-500 font-medium mt-2 leading-snug">
                                        Vista previa del panel que verá el comprador.
                                    </p>
                                </div>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPoliciesPreview(false)}
                                className="w-10 h-10 rounded-full bg-white text-gray-500 hover:bg-gray-100 flex items-center justify-center border border-gray-200 shadow-sm shrink-0"
                            >
                                <X size={18} />
                            </button>
                        </div>

                        <div className="p-5 space-y-2">
                            {reservationPolicies.map((policy, index) => (
                                <div
                                    key={index}
                                    className="bg-gray-50 rounded-xl p-3 border border-gray-100 shadow-sm flex items-center gap-3"
                                >
                                    <div className="w-10 h-10 rounded-full bg-white border border-gray-100 flex items-center justify-center shrink-0 shadow-sm">
                                        {renderPolicyIcon(policy.icon, 20)}
                                    </div>

                                    <div className="w-8 h-8 rounded-full bg-white border border-gray-200 flex items-center justify-center shrink-0 shadow-sm">
                                        <span className="text-xs font-black text-black">
                                            {index + 1}
                                        </span>
                                    </div>

                                    <p className="text-xs font-black text-black leading-snug">
                                        {policy.text}
                                    </p>
                                </div>
                            ))}

                            <div className="bg-gray-50 rounded-xl p-3 border border-gray-100 flex items-center gap-3 mt-3">
                                <div className="w-10 h-10 rounded-full bg-black text-white flex items-center justify-center shrink-0">
                                    <Info size={18} />
                                </div>

                                <p className="text-xs font-bold text-black leading-snug">
                                    Al continuar con tu compra, confirmas que has leído y aceptas estas políticas.
                                </p>
                            </div>

                            <button
                                type="button"
                                onClick={() => setShowPoliciesPreview(false)}
                                className="w-full mt-3 bg-black text-white py-4 rounded-xl font-black text-sm uppercase tracking-widest hover:bg-minimal-olive transition-all shadow-lg"
                            >
                                Entendido
                            </button>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default SettingsManager;