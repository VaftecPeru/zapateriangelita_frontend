import { useEffect, useMemo, useState } from 'react';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileText,
    Globe,
    Loader2,
    Plus,
    Save,
    Settings2,
    ShieldCheck,
    Smartphone,
    Trash2,
    X,
} from 'lucide-react';
import { settingsService } from '../../services/crudService';
import BannerSettingsSection from './BannerSettingsSection';

type ReservationPolicy = { text: string };
type Message = { type: 'success' | 'error'; text: string } | null;

const defaultPrivacyPolicies = [
    'En Zapatería Angelita respetamos y protegemos la privacidad de nuestros clientes.',
    'Los datos personales proporcionados durante el registro, compra o contacto serán utilizados únicamente para procesar pedidos, gestionar pagos, realizar envíos, brindar atención al cliente y mantener comunicación relacionada con nuestros servicios.',
    'La información personal será tratada de forma confidencial y no será compartida con terceros, salvo cuando sea necesario para procesar pagos, realizar entregas o cumplir con obligaciones legales.',
    'El usuario podrá solicitar en cualquier momento la actualización o corrección de sus datos personales mediante nuestros canales oficiales de atención.',
    'Al utilizar nuestro sitio web y proporcionar sus datos, el usuario acepta el tratamiento de su información conforme al presente Aviso de Privacidad.',
];

const defaultTerms = [
    'Al utilizar el sitio web de Zapatería Angelita, el usuario acepta los presentes términos y condiciones.',
    'Los precios, promociones, disponibilidad de productos, tallas y colores pueden cambiar sin previo aviso.',
    'Las compras estarán sujetas a confirmación de pago y disponibilidad de stock. Zapatería Angelita brindará información clara sobre sus productos, proceso de compra, envío y atención al cliente.',
    'El usuario es responsable de proporcionar información correcta durante el proceso de compra. Cualquier solicitud de cambio, devolución o aclaración deberá realizarse de acuerdo con las políticas vigentes.',
    'Al realizar una compra, el cliente declara haber leído y aceptado estos términos y condiciones.',
];

function CollapsibleCard({
    title,
    subtitle,
    icon,
    open,
    onToggle,
    children,
}: {
    title: string;
    subtitle?: string;
    icon: React.ReactNode;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) {
    return (
        <section className="overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm">
            <button
                type="button"
                onClick={onToggle}
                className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left transition-colors hover:bg-gray-50 sm:px-7"
                aria-expanded={open}
            >
                <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-gray-50 text-gray-500">{icon}</span>
                    <div className="min-w-0">
                        <h3 className="truncate text-xs font-black uppercase tracking-widest text-black sm:text-sm">{title}</h3>
                        {subtitle && <p className="mt-1 text-[10px] font-bold uppercase tracking-wide text-gray-400">{subtitle}</p>}
                    </div>
                </div>
                {open ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
            </button>
            {open && <div className="border-t border-gray-100 p-5 sm:p-7">{children}</div>}
        </section>
    );
}

const SettingsManager = () => {
    const [settings, setSettings] = useState<Record<string, string>>({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<Message>(null);

    const [whatsapp, setWhatsapp] = useState('');
    const [editingWhatsapp, setEditingWhatsapp] = useState(false);
    const [savingWhatsapp, setSavingWhatsapp] = useState(false);

    const [terms, setTerms] = useState<ReservationPolicy[]>(defaultTerms.map((text) => ({ text })));
    const [savingTerms, setSavingTerms] = useState(false);
    const [privacy, setPrivacy] = useState<string[]>(defaultPrivacyPolicies);
    const [savingPrivacy, setSavingPrivacy] = useState(false);

    const [openSections, setOpenSections] = useState<Record<string, boolean>>({
        whatsapp: true,
        terms: true,
        privacy: true,
    });

    const toggleSection = (key: string) => setOpenSections((current) => ({ ...current, [key]: !current[key] }));

    const parseList = (value: unknown, fallback: string[]) => {
        if (!value) return fallback;
        try {
            const parsed = typeof value === 'string' ? JSON.parse(value) : value;
            if (!Array.isArray(parsed)) return fallback;
            const normalized = parsed
                .map((item: any) => typeof item === 'string' ? item : item?.text)
                .map((item: unknown) => String(item || '').trim())
                .filter(Boolean);
            return normalized.length ? normalized : fallback;
        } catch {
            const text = String(value || '').trim();
            return text ? [text] : fallback;
        }
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsService.getAll();
            const data = response.data.data || {};
            setSettings(data);
            setWhatsapp(data.whatsapp_number || '');
            setTerms(parseList(data.reservation_policies, defaultTerms).map((text) => ({ text })));
            setPrivacy(parseList(data.privacy_policy, defaultPrivacyPolicies));
        } catch (error) {
            console.error('Error loading settings:', error);
            setMessage({ type: 'error', text: 'No se pudo cargar la configuración del sitio.' });
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        void loadSettings();
    }, []);

    const flash = (next: Message) => {
        setMessage(next);
        if (next) window.setTimeout(() => setMessage(null), 3500);
    };

    const saveWhatsapp = async () => {
        const clean = whatsapp.replace(/[^0-9]/g, '');
        if (!clean) {
            flash({ type: 'error', text: 'Ingresa un número de WhatsApp válido.' });
            return;
        }
        try {
            setSavingWhatsapp(true);
            await settingsService.update('whatsapp_number', clean);
            setWhatsapp(clean);
            setSettings((current) => ({ ...current, whatsapp_number: clean }));
            setEditingWhatsapp(false);
            flash({ type: 'success', text: 'Número de WhatsApp actualizado.' });
        } catch (error: any) {
            flash({ type: 'error', text: error.response?.data?.message || 'No se pudo guardar el número.' });
        } finally {
            setSavingWhatsapp(false);
        }
    };

    const saveTerms = async () => {
        const clean = terms.map((item) => item.text.trim()).filter(Boolean);
        if (!clean.length || clean.length !== terms.length) {
            flash({ type: 'error', text: 'Todos los términos deben contener texto.' });
            return;
        }
        try {
            setSavingTerms(true);
            await settingsService.update('reservation_policies', JSON.stringify(clean.map((text) => ({ text }))));
            setTerms(clean.map((text) => ({ text })));
            flash({ type: 'success', text: 'Términos y condiciones actualizados.' });
        } catch (error: any) {
            flash({ type: 'error', text: error.response?.data?.message || 'No se pudieron guardar los términos.' });
        } finally {
            setSavingTerms(false);
        }
    };

    const savePrivacy = async () => {
        const clean = privacy.map((item) => item.trim()).filter(Boolean);
        if (!clean.length || clean.length !== privacy.length) {
            flash({ type: 'error', text: 'Todos los puntos de privacidad deben contener texto.' });
            return;
        }
        try {
            setSavingPrivacy(true);
            await settingsService.update('privacy_policy', JSON.stringify(clean));
            setPrivacy(clean);
            flash({ type: 'success', text: 'Aviso de privacidad actualizado.' });
        } catch (error: any) {
            flash({ type: 'error', text: error.response?.data?.message || 'No se pudo guardar el aviso de privacidad.' });
        } finally {
            setSavingPrivacy(false);
        }
    };

    const configuredWhatsapp = useMemo(() => settings.whatsapp_number ? `+${settings.whatsapp_number}` : 'No configurado', [settings.whatsapp_number]);

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
                <Loader2 className="animate-spin text-store-red" size={28} />
                <p className="text-[10px] font-black uppercase tracking-[0.2em] text-gray-400">Cargando configuración...</p>
            </div>
        );
    }

    return (
        <div className="w-full space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex items-center gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-2xl border border-red-100 bg-red-50 text-store-red">
                    <Settings2 size={20} />
                </div>
                <div>
                    <h2 className="text-sm font-black uppercase tracking-widest text-black">Ajustes del sitio</h2>
                    <p className="text-[10px] font-bold uppercase tracking-wide text-gray-400">Gestiona contenido público, contacto y políticas</p>
                </div>
            </div>

            {message && (
                <div className={`flex items-center gap-2 rounded-2xl px-4 py-3 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                    {message.type === 'success' ? <CheckCircle2 size={16} /> : <AlertCircle size={16} />}
                    {message.text}
                </div>
            )}

            <BannerSettingsSection />

            <CollapsibleCard
                title="Número de WhatsApp"
                subtitle="Canal principal de atención"
                icon={<Smartphone size={18} />}
                open={openSections.whatsapp}
                onToggle={() => toggleSection('whatsapp')}
            >
                {editingWhatsapp ? (
                    <div className="flex flex-col gap-3 sm:flex-row">
                        <input
                            value={whatsapp}
                            onChange={(event) => setWhatsapp(event.target.value)}
                            placeholder="Ej. 51900112844"
                            className="min-w-0 flex-1 rounded-2xl border border-gray-200 bg-gray-50 px-4 py-3 text-sm font-bold outline-none focus:border-store-red focus:bg-white"
                        />
                        <button type="button" onClick={saveWhatsapp} disabled={savingWhatsapp} className="inline-flex items-center justify-center gap-2 rounded-2xl bg-black px-5 py-3 text-xs font-black uppercase tracking-widest text-white disabled:opacity-50">
                            {savingWhatsapp ? <Loader2 className="animate-spin" size={15} /> : <Save size={15} />} Guardar
                        </button>
                        <button type="button" onClick={() => { setWhatsapp(settings.whatsapp_number || ''); setEditingWhatsapp(false); }} className="inline-flex items-center justify-center rounded-2xl bg-gray-100 px-4 py-3 text-gray-500"><X size={16} /></button>
                    </div>
                ) : (
                    <div className="flex flex-col gap-4 rounded-2xl border border-gray-100 bg-gray-50 p-5 sm:flex-row sm:items-end sm:justify-between">
                        <div>
                            <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Configurado como</span>
                            <strong className="mt-1 block break-all text-2xl font-black text-black sm:text-3xl">{configuredWhatsapp}</strong>
                        </div>
                        <button type="button" onClick={() => setEditingWhatsapp(true)} className="rounded-xl bg-white px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-store-red shadow-sm">Editar</button>
                    </div>
                )}
            </CollapsibleCard>

            <div className="grid gap-5 xl:grid-cols-2">
                <CollapsibleCard
                    title="Términos y condiciones"
                    subtitle="Políticas de compra"
                    icon={<FileText size={18} />}
                    open={openSections.terms}
                    onToggle={() => toggleSection('terms')}
                >
                    <div className="space-y-3">
                        {terms.map((policy, index) => (
                            <div key={index} className="flex gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                                <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black">{index + 1}</span>
                                <textarea
                                    rows={2}
                                    value={policy.text}
                                    onChange={(event) => setTerms((current) => current.map((item, itemIndex) => itemIndex === index ? { text: event.target.value } : item))}
                                    className="min-h-[70px] flex-1 resize-y rounded-xl border border-transparent bg-white px-3 py-2 text-xs leading-relaxed outline-none focus:border-store-red"
                                />
                                <button type="button" onClick={() => setTerms((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="self-start p-2 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                            </div>
                        ))}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <button type="button" onClick={() => setTerms((current) => [...current, { text: '' }])} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600"><Plus size={14} /> Agregar política</button>
                            <button type="button" onClick={saveTerms} disabled={savingTerms} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50">{savingTerms ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Guardar</button>
                        </div>
                    </div>
                </CollapsibleCard>

                <CollapsibleCard
                    title="Aviso de privacidad"
                    subtitle="Tratamiento de datos personales"
                    icon={<ShieldCheck size={18} />}
                    open={openSections.privacy}
                    onToggle={() => toggleSection('privacy')}
                >
                    <div className="space-y-3">
                        {privacy.map((policy, index) => (
                            <div key={index} className="flex gap-2 rounded-2xl border border-gray-100 bg-gray-50 p-3">
                                <span className="mt-2 flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-white text-[10px] font-black">{index + 1}</span>
                                <textarea
                                    rows={2}
                                    value={policy}
                                    onChange={(event) => setPrivacy((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                                    className="min-h-[70px] flex-1 resize-y rounded-xl border border-transparent bg-white px-3 py-2 text-xs leading-relaxed outline-none focus:border-store-red"
                                />
                                <button type="button" onClick={() => setPrivacy((current) => current.filter((_, itemIndex) => itemIndex !== index))} className="self-start p-2 text-gray-400 hover:text-red-600"><Trash2 size={15} /></button>
                            </div>
                        ))}
                        <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                            <button type="button" onClick={() => setPrivacy((current) => [...current, ''])} className="inline-flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-gray-600"><Plus size={14} /> Agregar punto</button>
                            <button type="button" onClick={savePrivacy} disabled={savingPrivacy} className="inline-flex items-center gap-2 rounded-xl bg-black px-4 py-2.5 text-[10px] font-black uppercase tracking-widest text-white disabled:opacity-50">{savingPrivacy ? <Loader2 className="animate-spin" size={14} /> : <Save size={14} />} Guardar</button>
                        </div>
                    </div>
                </CollapsibleCard>
            </div>

            <div className="flex items-center gap-3 rounded-2xl border border-gray-100 bg-white px-5 py-4 text-xs text-gray-500">
                <Globe size={18} className="text-store-red" />
                Los cambios guardados se sincronizan con la portada pública mediante la API del sitio.
            </div>
        </div>
    );
};

export default SettingsManager;
