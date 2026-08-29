import { useEffect, useState } from 'react';
import { settingsService } from '../../services/crudService';
import { Loader2, Smartphone, Save, CheckCircle2, AlertCircle, X, Settings2, ShieldCheck, Globe } from 'lucide-react';

const SettingsManager = () => {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [inputValue, setInputValue] = useState('');
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [isEditing, setIsEditing] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);

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
        } catch (err) {
            console.error('Error loading settings:', err);
            setMessage({ type: 'error', text: 'Error al conectar con el servidor.' });
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

    const handleCancel = () => {
        setInputValue(settings.whatsapp_number || '');
        setIsEditing(false);
        setMessage(null);
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center p-12 space-y-4">
                <div className="relative">
                    <div className="w-12 h-12 border-4 border-store-red/20 border-t-store-red rounded-full animate-spin"></div>
                    <Settings2 className="absolute inset-0 m-auto text-store-red animate-pulse" size={20} />
                </div>
                <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.2em]">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="w-full max-w-md mx-auto lg:max-w-none animate-in fade-in slide-in-from-bottom-4 duration-500">
            {/* Header */}
            <div className="flex items-center gap-3 mb-6">
                <div className="w-10 h-10 bg-store-red/10 rounded-2xl flex items-center justify-center text-store-red border border-store-red/20 flex-shrink-0">
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
                                <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-store-red/10 transition-colors flex-shrink-0">
                                    <Smartphone size={16} className="text-gray-400 group-hover:text-store-red transition-colors" />
                                </div>
                                <span className="text-[10px] sm:text-[11px] font-black text-black uppercase tracking-widest truncate">Número de WhatsApp</span>
                            </div>
                            
                            {!isEditing && (
                                <button 
                                    onClick={() => setIsEditing(true)}
                                    className="px-3 sm:px-4 py-1.5 bg-store-red/5 hover:bg-store-red/10 text-store-red rounded-full text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap"
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
                                            className="w-full pl-4 pr-4 py-3 sm:py-4 bg-gray-50 border-2 border-transparent rounded-2xl sm:rounded-[1.25rem] text-sm font-black text-black placeholder:text-gray-300 focus:bg-white focus:border-store-red outline-none transition-all"
                                            placeholder="Ej: 51968231620"
                                            autoFocus
                                        />
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button 
                                            onClick={handleSave}
                                            disabled={saving}
                                            className="flex-1 sm:flex-none h-12 uppercase sm:h-auto sm:w-12 sm:aspect-square bg-store-red text-white rounded-2xl flex items-center justify-center hover:bg-store-redDark transition-all disabled:opacity-50 text-[10px] font-black tracking-widest sm:text-base"
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
        </div>
    );
};

export default SettingsManager;
