import { useEffect, useState } from 'react';
import { settingsService } from '../../services/crudService';
import {
    Loader2,
    Smartphone,
    Save,
    CheckCircle2,
    AlertCircle,
    X,
    Settings2,
    ShieldCheck,
    Globe,
    FileText,
    Plus,
    Trash2,
} from 'lucide-react';

type ReservationPolicy = {
    text: string;
};

const defaultPrivacyPolicies = [
    'Usamos tus datos personales únicamente para gestionar tus pedidos, coordinar la entrega y brindarte atención relacionada con tu compra.',
    'No compartimos tu información con terceros salvo cuando sea necesario para prestar estos servicios o cumplir obligaciones legales.',
];

const SettingsManager = () => {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);
    const [reservationPolicies, setReservationPolicies] = useState<ReservationPolicy[]>([]);
    const [isEditingPolicies, setIsEditingPolicies] = useState(false);
    const [savingPolicies, setSavingPolicies] = useState(false);
    const [privacyPolicies, setPrivacyPolicies] = useState<string[]>(defaultPrivacyPolicies);
    const [isEditingPrivacy, setIsEditingPrivacy] = useState(false);
    const [savingPrivacy, setSavingPrivacy] = useState(false);

    useEffect(() => {
        loadSettings();
    }, []);

    const loadSettings = async () => {
        try {
            setLoading(true);

            const response = await settingsService.getAll();
            const data = response.data.data || {};

            setSettings(data);
            setInputValue(data.whatsapp_number || '');

            const savedPrivacy = data.privacy_policy || '';
            let parsedPrivacy: unknown = savedPrivacy;
            try {
                parsedPrivacy = savedPrivacy ? JSON.parse(savedPrivacy) : [];
            } catch {
                parsedPrivacy = savedPrivacy ? [savedPrivacy] : [];
            }
            setPrivacyPolicies(
                Array.isArray(parsedPrivacy)
                    ? parsedPrivacy
                        .map((item) => (typeof item === 'string' ? item : (item as any)?.text))
                        .filter((item): item is string => Boolean(item?.trim()))
                    : defaultPrivacyPolicies,
            );

            if (data.reservation_policies) {
                const parsedPolicies =
                    typeof data.reservation_policies === 'string'
                        ? JSON.parse(data.reservation_policies)
                        : data.reservation_policies;

                if (Array.isArray(parsedPolicies)) {
                    const normalizedPolicies: ReservationPolicy[] = parsedPolicies.map((item: any) => {
                        if (typeof item === 'string') {
                            return { text: item };
                        }
                        return { text: item?.text || '' };
                    });

                    setReservationPolicies(normalizedPolicies);
                } else {
                    setReservationPolicies([]);
                }
            } else {
                setReservationPolicies([]);
            }
        } catch (err) {
            console.error('Error loading settings:', err);
            setMessage({
                type: 'error',
                text: 'Error al conectar con el servidor.',
            });

            setReservationPolicies([]);
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

            setSettings((prev) => ({ ...prev, whatsapp_number: cleanValue }));
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
        const cleanPolicies = reservationPolicies.map((policy) => ({
            text: policy.text.trim(),
        }));

        const hasEmptyPolicy = cleanPolicies.some((policy) => !policy.text);

        if (hasEmptyPolicy) {
            setMessage({
                type: 'error',
                text: 'Todas las políticas deben tener texto.',
            });
            return;
        }

        try {
            setSavingPolicies(true);
            setMessage(null);

            await settingsService.update('reservation_policies', JSON.stringify(cleanPolicies));

            setSettings((prev) => ({
                ...prev,
                reservation_policies: JSON.stringify(cleanPolicies),
            }));

            setReservationPolicies(cleanPolicies);
            setIsEditingPolicies(false);

            setMessage({
                type: 'success',
                text: 'Políticas guardadas correctamente.',
            });

            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            console.error('Error saving reservation policies:', err);
            setMessage({
                type: 'error',
                text: `Error al guardar políticas: ${err.response?.status || 'desconocido'}`,
            });
        } finally {
            setSavingPolicies(false);
        }
    };

    const addPolicy = () => {
        setReservationPolicies((current) => [...current, { text: '' }]);
        setIsEditingPolicies(true);
    };

    const removePolicy = (indexToRemove: number) => {
        setReservationPolicies((current) => current.filter((_, index) => index !== indexToRemove));
    };

    const handleCancel = () => {
        setInputValue(settings.whatsapp_number || '');
        setIsEditing(false);
        setMessage(null);
    };

    const handleSavePrivacy = async () => {
        const cleanPrivacy = privacyPolicies.map((policy) => policy.trim());

        if (cleanPrivacy.some((policy) => !policy)) {
            setMessage({ type: 'error', text: 'Todos los puntos de privacidad deben tener texto.' });
            return;
        }

        try {
            setSavingPrivacy(true);
            setMessage(null);
            const serializedPrivacy = JSON.stringify(cleanPrivacy);
            await settingsService.update('privacy_policy', serializedPrivacy);
            setPrivacyPolicies(cleanPrivacy);
            setSettings((prev) => ({ ...prev, privacy_policy: serializedPrivacy }));
            setIsEditingPrivacy(false);
            setMessage({ type: 'success', text: 'Aviso de privacidad guardado correctamente.' });
            setTimeout(() => setMessage(null), 3000);
        } catch (err: any) {
            setMessage({
                type: 'error',
                text: `Error al guardar privacidad: ${err.response?.status || 'desconocido'}`,
            });
        } finally {
            setSavingPrivacy(false);
        }
    };

    const addPrivacyPolicy = () => {
        setPrivacyPolicies((current) => [...current, '']);
        setIsEditingPrivacy(true);
    };

    const removePrivacyPolicy = (indexToRemove: number) => {
        setPrivacyPolicies((current) => current.filter((_, index) => index !== indexToRemove));
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
                                            {saving ? (
                                                <Loader2 size={16} className="animate-spin" />
                                            ) : (
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
                                        {settings.whatsapp_number ? (
                                            `+${settings.whatsapp_number}`
                                        ) : (
                                            <span className="text-red-400">No configurado</span>
                                        )}
                                    </span>
                                </div>
                                <div className="flex flex-col items-start sm:items-end gap-2">
                                    <div
                                        className={`flex items-center gap-1.5 px-3 py-1 rounded-full border ${
                                            settings.whatsapp_number
                                                ? 'bg-emerald-500/10 border-emerald-500/20 text-emerald-600'
                                                : 'bg-red-500/10 border-red-500/20 text-red-600'
                                        }`}
                                    >
                                        <div
                                            className={`w-1.5 h-1.5 rounded-full animate-pulse ${
                                                settings.whatsapp_number ? 'bg-emerald-500' : 'bg-red-500'
                                            }`}
                                        />
                                        <span className="text-[9px] font-black uppercase tracking-widest">
                                            {settings.whatsapp_number ? 'Sincronizado' : 'No Sincronizado'}
                                        </span>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    <div className="grid grid-cols-1 gap-6 border-t border-gray-100 pt-6 xl:grid-cols-2">
                        <div className="space-y-4">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-minimal-olive/10 transition-colors flex-shrink-0">
                                        <FileText size={16} className="text-gray-400 group-hover:text-minimal-olive transition-colors" />
                                    </div>
                                    <span className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest truncate">
                                        Términos y Condiciones
                                    </span>
                                </div>

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

                            {isEditingPolicies ? (
                                <div className="space-y-3 animate-in fade-in slide-in-from-top-2 duration-300">
                                    {reservationPolicies.map((policy, index) => (
                                        <div key={index} className="bg-gray-50 rounded-2xl p-4 border border-gray-100 space-y-3">
                                            <div className="flex items-center gap-3">
                                                <div className="w-8 h-8 bg-white rounded-full border border-gray-200 flex items-center justify-center shrink-0">
                                                    <span className="text-xs font-black text-black">{index + 1}</span>
                                                </div>

                                                <button
                                                    type="button"
                                                    onClick={() => removePolicy(index)}
                                                    aria-label={`Eliminar política ${index + 1}`}
                                                    className="ml-auto flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
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
                                            onClick={addPolicy}
                                            className="flex-1 rounded-2xl border border-dashed border-gray-300 bg-white py-3 text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:border-minimal-olive hover:text-minimal-olive"
                                        >
                                            <Plus size={14} className="mr-2 inline" />
                                            Agregar política
                                        </button>
                                        <button
                                            type="button"
                                            onClick={handleSavePolicies}
                                            disabled={savingPolicies}
                                            className="flex-1 bg-black text-white py-3 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-minimal-olive transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                        >
                                            {savingPolicies ? <Loader2 size={14} className="animate-spin" /> : <Save size={14} />}
                                            Guardar Términos
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
                                        <div key={index} className="flex items-center gap-3 bg-white rounded-xl p-3 border border-gray-100">
                                            <div className="w-7 h-7 rounded-full bg-gray-50 border border-gray-200 flex items-center justify-center shrink-0">
                                                <span className="text-[10px] font-black text-black">{index + 1}</span>
                                            </div>

                                            <p className="text-xs font-bold text-gray-600 leading-snug line-clamp-2">{policy.text}</p>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addPolicy}
                                        className="w-full rounded-xl border border-dashed border-gray-300 bg-white p-3 text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:border-minimal-olive hover:text-minimal-olive"
                                    >
                                        <Plus size={14} className="mr-2 inline" />
                                        Agregar política
                                    </button>
                                </div>
                            )}
                        </div>

                        {/* Aviso de privacidad */}
                        <div className="space-y-4 border-t border-gray-100 pt-6 xl:border-l xl:border-t-0 xl:pl-6 xl:pt-0">
                            <div className="flex items-center justify-between gap-4">
                                <div className="flex items-center gap-2">
                                    <div className="flex-shrink-0 rounded-xl bg-gray-50 p-2">
                                        <ShieldCheck size={16} className="text-gray-400" />
                                    </div>
                                    <span className="truncate text-[10px] font-black uppercase tracking-widest text-black sm:text-[11px]">
                                        Aviso de privacidad
                                    </span>
                                </div>

                                {!isEditingPrivacy && (
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setIsEditingPrivacy(true);
                                        }}
                                        className="whitespace-nowrap rounded-full bg-minimal-olive/5 px-3 py-1.5 text-[10px] font-black uppercase tracking-widest text-minimal-olive transition-all hover:bg-minimal-olive/10 sm:px-4"
                                    >
                                        Editar
                                    </button>
                                )}
                            </div>

                            {isEditingPrivacy ? (
                                <div className="space-y-3">
                                    {privacyPolicies.map((policy, index) => (
                                        <div key={index} className="space-y-3 rounded-2xl border border-gray-100 bg-gray-50 p-4">
                                            <div className="flex items-center gap-3">
                                                <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-gray-200 bg-white text-xs font-black text-black">
                                                    {index + 1}
                                                </div>
                                                <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">
                                                    Punto de privacidad {index + 1}
                                                </span>
                                                <button
                                                    type="button"
                                                    onClick={() => removePrivacyPolicy(index)}
                                                    aria-label={`Eliminar punto de privacidad ${index + 1}`}
                                                    className="ml-auto flex h-8 w-8 shrink-0 items-center justify-center rounded-xl border border-red-100 bg-white text-red-400 transition-colors hover:bg-red-50 hover:text-red-600"
                                                >
                                                    <Trash2 size={15} />
                                                </button>
                                            </div>
                                            <textarea
                                                value={policy}
                                                onChange={(e) => {
                                                    const updatedPolicies = [...privacyPolicies];
                                                    updatedPolicies[index] = e.target.value;
                                                    setPrivacyPolicies(updatedPolicies);
                                                }}
                                                rows={3}
                                                className="w-full resize-none rounded-xl border border-gray-100 bg-white px-4 py-3 text-xs font-bold text-black outline-none focus:border-minimal-olive"
                                                placeholder={`Punto de privacidad ${index + 1}`}
                                            />
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addPrivacyPolicy}
                                        className="w-full rounded-xl border border-dashed border-gray-300 bg-white p-3 text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:border-minimal-olive hover:text-minimal-olive"
                                    >
                                        <Plus size={14} className="mr-2 inline" />
                                        Agregar punto de privacidad
                                    </button>
                                    <div className="flex gap-2">
                                        <button
                                            type="button"
                                            onClick={handleSavePrivacy}
                                            disabled={savingPrivacy}
                                            className="flex-1 rounded-2xl bg-black py-3 text-xs font-black uppercase tracking-widest text-white transition-all hover:bg-minimal-olive disabled:opacity-50"
                                        >
                                            {savingPrivacy ? <Loader2 size={14} className="mx-auto animate-spin" /> : 'Guardar privacidad'}
                                        </button>
                                        <button
                                            type="button"
                                            onClick={() => {
                                                setIsEditingPrivacy(false);
                                                loadSettings();
                                            }}
                                            className="rounded-2xl bg-gray-50 px-4 py-3 text-xs font-black uppercase tracking-widest text-gray-500 transition-all hover:bg-gray-100"
                                        >
                                            Cancelar
                                        </button>
                                    </div>
                                </div>
                            ) : (
                                <div className="min-h-[250px] space-y-3 rounded-2xl border border-black/[0.02] bg-gray-50 p-5">
                                    {privacyPolicies.map((policy, index) => (
                                        <div key={index} className="flex items-start gap-3 rounded-xl border border-gray-100 bg-white p-3">
                                            <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-50 text-[10px] font-black text-black">
                                                {index + 1}
                                            </div>
                                            <p className="whitespace-pre-line text-xs font-bold leading-relaxed text-gray-600">
                                                {policy}
                                            </p>
                                        </div>
                                    ))}
                                    <button
                                        type="button"
                                        onClick={addPrivacyPolicy}
                                        className="w-full rounded-xl border border-dashed border-gray-300 bg-white p-3 text-xs font-black uppercase tracking-widest text-gray-600 transition-all hover:border-minimal-olive hover:text-minimal-olive"
                                    >
                                        <Plus size={14} className="mr-2 inline" />
                                        Agregar punto de privacidad
                                    </button>
                                </div>
                            )}
                        </div>
                    </div>
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
        </div>
    );
};

export default SettingsManager;