import { useEffect, useMemo, useState } from 'react';
import { settingsService } from '../../services/crudService';
import { getImageUrl } from '../../config/api';
import {
    AlertCircle,
    CheckCircle2,
    ChevronDown,
    ChevronUp,
    FileImage,
    FileText,
    GripVertical,
    Loader2,
    Palette,
    Plus,
    Save,
    Settings2,
    ShieldCheck,
    Smartphone,
    Trash2,
    Upload,
    X,
} from 'lucide-react';

type ReservationPolicy = {
    text: string;
};

type HomeBanner = {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imagePosition: string;
    textColor: string;
    active: boolean;
};

type CollapsibleKey = 'contact' | 'legal' | 'banners';

const defaultPrivacyPolicies = [
    'Usamos tus datos personales únicamente para gestionar tus pedidos, coordinar la entrega y brindarte atención relacionada con tu compra.',
    'No compartimos tu información con terceros salvo cuando sea necesario para prestar estos servicios o cumplir obligaciones legales.',
];

const newBanner = (): HomeBanner => ({
    id: `banner-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
    eyebrow: 'Colección Angelita',
    title: '',
    description: '',
    image: '',
    imagePosition: 'center center',
    textColor: '#ffffff',
    active: true,
});

const normalizeStringList = (value?: string): string[] => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        if (Array.isArray(parsed)) {
            return parsed
                .map((item) => (typeof item === 'string' ? item : item?.text))
                .filter((item): item is string => Boolean(item?.trim()));
        }
    } catch {
        return [value];
    }
    return [];
};

const normalizeBanners = (value?: string): HomeBanner[] => {
    if (!value) return [];
    try {
        const parsed = JSON.parse(value);
        if (!Array.isArray(parsed)) return [];
        return parsed.map((banner: any, index: number) => ({
            id: String(banner?.id || `banner-${index + 1}`),
            eyebrow: String(banner?.eyebrow || ''),
            title: String(banner?.title || ''),
            description: String(banner?.description || ''),
            image: String(banner?.image || ''),
            imagePosition: String(banner?.imagePosition || 'center center'),
            textColor: /^#[0-9a-fA-F]{6}$/.test(String(banner?.textColor || ''))
                ? String(banner.textColor)
                : '#ffffff',
            active: banner?.active !== false,
        }));
    } catch {
        return [];
    }
};

const CollapsibleCard = ({
    title,
    subtitle,
    icon,
    open,
    onToggle,
    children,
}: {
    title: string;
    subtitle: string;
    icon: React.ReactNode;
    open: boolean;
    onToggle: () => void;
    children: React.ReactNode;
}) => (
    <section className="overflow-hidden rounded-[1.75rem] border border-gray-100 bg-white shadow-xl shadow-black/[0.025]">
        <button
            type="button"
            onClick={onToggle}
            className="flex w-full items-center justify-between gap-4 px-5 py-5 text-left sm:px-7"
            aria-expanded={open}
        >
            <div className="flex min-w-0 items-center gap-3">
                <div className="grid h-10 w-10 flex-shrink-0 place-items-center rounded-2xl bg-gray-50 text-gray-500">
                    {icon}
                </div>
                <div className="min-w-0">
                    <h3 className="truncate text-[11px] font-black uppercase tracking-[0.14em] text-black">{title}</h3>
                    <p className="mt-1 text-[10px] font-semibold text-gray-400">{subtitle}</p>
                </div>
            </div>
            <div className="grid h-9 w-9 flex-shrink-0 place-items-center rounded-full bg-gray-50 text-gray-500 transition hover:bg-gray-100 hover:text-black">
                {open ? <ChevronUp size={17} /> : <ChevronDown size={17} />}
            </div>
        </button>
        {open && <div className="border-t border-gray-100 px-5 py-5 sm:px-7 sm:py-6">{children}</div>}
    </section>
);

const SettingsManager = () => {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    const [whatsapp, setWhatsapp] = useState('');
    const [savingWhatsapp, setSavingWhatsapp] = useState(false);

    const [reservationPolicies, setReservationPolicies] = useState<ReservationPolicy[]>([]);
    const [privacyPolicies, setPrivacyPolicies] = useState<string[]>(defaultPrivacyPolicies);
    const [savingLegal, setSavingLegal] = useState(false);

    const [banners, setBanners] = useState<HomeBanner[]>([]);
    const [savingBanners, setSavingBanners] = useState(false);
    const [uploadingBannerId, setUploadingBannerId] = useState<string | null>(null);
    const [expandedBanners, setExpandedBanners] = useState<Record<string, boolean>>({});

    const [openSections, setOpenSections] = useState<Record<CollapsibleKey, boolean>>({
        contact: true,
        legal: false,
        banners: true,
    });

    const activeBannerCount = useMemo(() => banners.filter((banner) => banner.active).length, [banners]);

    useEffect(() => {
        void loadSettings();
    }, []);

    const notify = (type: 'success' | 'error', text: string) => {
        setMessage({ type, text });
        window.setTimeout(() => setMessage(null), 4000);
    };

    const loadSettings = async () => {
        try {
            setLoading(true);
            const response = await settingsService.getAll();
            const data = response.data.data || {};
            setSettings(data);
            setWhatsapp(data.whatsapp_number || '');

            const terms = normalizeStringList(data.reservation_policies);
            setReservationPolicies(terms.map((text) => ({ text })));

            const privacy = normalizeStringList(data.privacy_policy);
            setPrivacyPolicies(privacy.length ? privacy : defaultPrivacyPolicies);

            const parsedBanners = normalizeBanners(data.homepage_banners);
            setBanners(parsedBanners);
            setExpandedBanners(
                Object.fromEntries(parsedBanners.map((banner, index) => [banner.id, index === 0])),
            );
        } catch (error) {
            console.error('Error loading settings:', error);
            notify('error', 'No se pudo cargar la configuración del sitio.');
        } finally {
            setLoading(false);
        }
    };

    const toggleSection = (key: CollapsibleKey) => {
        setOpenSections((current) => ({ ...current, [key]: !current[key] }));
    };

    const saveWhatsapp = async () => {
        const cleanValue = whatsapp.replace(/[^0-9]/g, '');
        if (!cleanValue) {
            notify('error', 'El número de WhatsApp no puede estar vacío.');
            return;
        }
        try {
            setSavingWhatsapp(true);
            await settingsService.update('whatsapp_number', cleanValue);
            setWhatsapp(cleanValue);
            setSettings((current) => ({ ...current, whatsapp_number: cleanValue }));
            notify('success', 'Número de WhatsApp actualizado.');
        } catch (error) {
            console.error(error);
            notify('error', 'No se pudo guardar el número de WhatsApp.');
        } finally {
            setSavingWhatsapp(false);
        }
    };

    const saveLegal = async () => {
        const terms = reservationPolicies.map((item) => item.text.trim()).filter(Boolean);
        const privacy = privacyPolicies.map((item) => item.trim()).filter(Boolean);

        if (terms.length !== reservationPolicies.length || privacy.length !== privacyPolicies.length) {
            notify('error', 'No dejes puntos legales vacíos.');
            return;
        }

        try {
            setSavingLegal(true);
            await Promise.all([
                settingsService.update('reservation_policies', JSON.stringify(terms.map((text) => ({ text })))),
                settingsService.update('privacy_policy', JSON.stringify(privacy)),
            ]);
            notify('success', 'Términos y privacidad actualizados.');
        } catch (error) {
            console.error(error);
            notify('error', 'No se pudieron guardar las políticas.');
        } finally {
            setSavingLegal(false);
        }
    };

    const updateBanner = <K extends keyof HomeBanner>(id: string, key: K, value: HomeBanner[K]) => {
        setBanners((current) => current.map((banner) => (banner.id === id ? { ...banner, [key]: value } : banner)));
    };

    const addBanner = () => {
        const banner = newBanner();
        setBanners((current) => [...current, banner]);
        setExpandedBanners((current) => ({ ...current, [banner.id]: true }));
    };

    const removeBanner = (id: string) => {
        setBanners((current) => current.filter((banner) => banner.id !== id));
    };

    const moveBanner = (index: number, direction: -1 | 1) => {
        setBanners((current) => {
            const target = index + direction;
            if (target < 0 || target >= current.length) return current;
            const copy = [...current];
            [copy[index], copy[target]] = [copy[target], copy[index]];
            return copy;
        });
    };

    const uploadBannerImage = async (bannerId: string, file?: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            notify('error', 'Selecciona una imagen JPG, PNG o WEBP.');
            return;
        }

        try {
            setUploadingBannerId(bannerId);
            const response = await settingsService.uploadBannerImage(file);
            const path = response.data?.data?.path;
            if (!path) throw new Error('El servidor no devolvió la ruta de la imagen.');
            updateBanner(bannerId, 'image', path);
            notify('success', 'Imagen cargada. Guarda los banners para publicarla.');
        } catch (error) {
            console.error(error);
            notify('error', 'No se pudo cargar la imagen del banner.');
        } finally {
            setUploadingBannerId(null);
        }
    };

    const saveBanners = async () => {
        if (banners.length > 12) {
            notify('error', 'La portada admite como máximo 12 banners.');
            return;
        }

        const invalid = banners.find((banner) => !banner.title.trim() || !banner.image.trim());
        if (invalid) {
            notify('error', 'Cada banner necesita título e imagen antes de guardar.');
            setExpandedBanners((current) => ({ ...current, [invalid.id]: true }));
            return;
        }

        const payload = banners.map((banner) => ({
            ...banner,
            eyebrow: banner.eyebrow.trim(),
            title: banner.title.trim().slice(0, 120),
            description: banner.description.trim().slice(0, 220),
            image: banner.image.trim(),
            imagePosition: banner.imagePosition.trim() || 'center center',
            textColor: banner.textColor,
            active: Boolean(banner.active),
        }));

        try {
            setSavingBanners(true);
            const serialized = JSON.stringify(payload);
            await settingsService.update('homepage_banners', serialized);
            setSettings((current) => ({ ...current, homepage_banners: serialized }));
            setBanners(payload);
            notify('success', 'Banners de portada guardados correctamente.');
        } catch (error) {
            console.error(error);
            notify('error', 'No se pudieron guardar los banners.');
        } finally {
            setSavingBanners(false);
        }
    };

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center gap-4 p-12">
                <Loader2 size={30} className="animate-spin text-store-red" />
                <p className="text-[10px] font-black uppercase tracking-[0.18em] text-gray-400">Cargando ajustes...</p>
            </div>
        );
    }

    return (
        <div className="mx-auto w-full max-w-[1450px] space-y-5 animate-in fade-in slide-in-from-bottom-4 duration-500">
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-3">
                    <div className="grid h-10 w-10 place-items-center rounded-2xl border border-red-100 bg-red-50 text-store-red">
                        <Settings2 size={19} />
                    </div>
                    <div>
                        <h2 className="text-sm font-black uppercase tracking-widest text-black">Ajustes del sitio</h2>
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-tight text-gray-400">
                            Contacto, políticas y contenido de la portada
                        </p>
                    </div>
                </div>

                {message && (
                    <div className={`flex items-center gap-2 rounded-xl border px-4 py-2 text-xs font-bold ${
                        message.type === 'success'
                            ? 'border-emerald-200 bg-emerald-50 text-emerald-700'
                            : 'border-red-200 bg-red-50 text-red-700'
                    }`}>
                        {message.type === 'success' ? <CheckCircle2 size={15} /> : <AlertCircle size={15} />}
                        {message.text}
                    </div>
                )}
            </div>

            <CollapsibleCard
                title="Número de WhatsApp"
                subtitle="Canal principal de atención al cliente"
                icon={<Smartphone size={17} />}
                open={openSections.contact}
                onToggle={() => toggleSection('contact')}
            >
                <div className="grid gap-4 lg:grid-cols-[1fr_auto] lg:items-end">
                    <label className="block">
                        <span className="mb-2 block text-[10px] font-black uppercase tracking-widest text-gray-500">Número internacional</span>
                        <input
                            value={whatsapp}
                            onChange={(event) => setWhatsapp(event.target.value)}
                            className="h-12 w-full rounded-2xl border border-gray-200 bg-gray-50 px-4 text-sm font-bold outline-none transition focus:border-store-red focus:bg-white"
                            placeholder="51900112844"
                        />
                    </label>
                    <button
                        type="button"
                        onClick={saveWhatsapp}
                        disabled={savingWhatsapp}
                        className="flex h-12 items-center justify-center gap-2 rounded-2xl bg-black px-6 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-store-red disabled:opacity-50"
                    >
                        {savingWhatsapp ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Guardar
                    </button>
                </div>
            </CollapsibleCard>

            <CollapsibleCard
                title="Términos y privacidad"
                subtitle="Textos legales visibles para clientes"
                icon={<ShieldCheck size={17} />}
                open={openSections.legal}
                onToggle={() => toggleSection('legal')}
            >
                <div className="grid gap-6 xl:grid-cols-2">
                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-black">
                                <FileText size={15} /> Términos y condiciones
                            </div>
                            <button
                                type="button"
                                onClick={() => setReservationPolicies((current) => [...current, { text: '' }])}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-store-red"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {reservationPolicies.map((policy, index) => (
                                <div key={`term-${index}`} className="flex gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2">
                                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-white text-[10px] font-black">{index + 1}</span>
                                    <textarea
                                        value={policy.text}
                                        onChange={(event) => setReservationPolicies((current) => current.map((item, itemIndex) => itemIndex === index ? { text: event.target.value } : item))}
                                        className="min-h-[72px] flex-1 resize-y bg-transparent p-2 text-xs font-medium leading-relaxed outline-none"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Eliminar política"
                                        onClick={() => setReservationPolicies((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                        className="h-8 w-8 text-gray-400 transition hover:text-store-red"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div>
                        <div className="mb-3 flex items-center justify-between">
                            <div className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-black">
                                <ShieldCheck size={15} /> Aviso de privacidad
                            </div>
                            <button
                                type="button"
                                onClick={() => setPrivacyPolicies((current) => [...current, ''])}
                                className="flex items-center gap-1 text-[10px] font-black uppercase tracking-wider text-store-red"
                            >
                                <Plus size={14} /> Agregar
                            </button>
                        </div>
                        <div className="space-y-2">
                            {privacyPolicies.map((policy, index) => (
                                <div key={`privacy-${index}`} className="flex gap-2 rounded-xl border border-gray-100 bg-gray-50 p-2">
                                    <span className="grid h-8 w-8 flex-shrink-0 place-items-center rounded-full bg-white text-[10px] font-black">{index + 1}</span>
                                    <textarea
                                        value={policy}
                                        onChange={(event) => setPrivacyPolicies((current) => current.map((item, itemIndex) => itemIndex === index ? event.target.value : item))}
                                        className="min-h-[72px] flex-1 resize-y bg-transparent p-2 text-xs font-medium leading-relaxed outline-none"
                                    />
                                    <button
                                        type="button"
                                        aria-label="Eliminar punto de privacidad"
                                        onClick={() => setPrivacyPolicies((current) => current.filter((_, itemIndex) => itemIndex !== index))}
                                        className="h-8 w-8 text-gray-400 transition hover:text-store-red"
                                    >
                                        <Trash2 size={15} />
                                    </button>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="mt-5 flex justify-end">
                    <button
                        type="button"
                        onClick={saveLegal}
                        disabled={savingLegal}
                        className="flex h-11 items-center gap-2 rounded-xl bg-black px-5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-store-red disabled:opacity-50"
                    >
                        {savingLegal ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Guardar políticas
                    </button>
                </div>
            </CollapsibleCard>

            <CollapsibleCard
                title="Banners de portada"
                subtitle={`${banners.length} banner(s) · ${activeBannerCount} activo(s) · máximo 12`}
                icon={<FileImage size={17} />}
                open={openSections.banners}
                onToggle={() => toggleSection('banners')}
            >
                <div className="mb-5 flex flex-col gap-3 rounded-2xl border border-red-100 bg-red-50/50 p-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <p className="text-xs font-black text-black">Gestión dinámica del slider principal</p>
                        <p className="mt-1 max-w-3xl text-[11px] leading-relaxed text-gray-500">
                            Puedes cargar imágenes, editar textos, definir color del texto, posición de la imagen, activar/desactivar banners y cambiar el orden. El título en la portada se limita visualmente a tres líneas.
                        </p>
                    </div>
                    <button
                        type="button"
                        onClick={addBanner}
                        disabled={banners.length >= 12}
                        className="flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-store-red px-5 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-40"
                    >
                        <Plus size={15} /> Nuevo banner
                    </button>
                </div>

                {!banners.length ? (
                    <div className="rounded-2xl border border-dashed border-gray-300 bg-gray-50 px-5 py-10 text-center">
                        <FileImage size={28} className="mx-auto mb-3 text-gray-300" />
                        <p className="text-xs font-black text-black">Aún no hay banners administrables</p>
                        <p className="mx-auto mt-2 max-w-xl text-[11px] leading-relaxed text-gray-500">
                            Mientras no publiques banners personalizados, la tienda conserva los banners predeterminados actuales. Crea el primero para comenzar a gestionarlos desde el intranet.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {banners.map((banner, index) => {
                            const expanded = expandedBanners[banner.id] ?? false;
                            return (
                                <article key={banner.id} className="overflow-hidden rounded-2xl border border-gray-200 bg-white">
                                    <div className="flex items-center gap-3 p-3 sm:p-4">
                                        <GripVertical size={17} className="flex-shrink-0 text-gray-300" />
                                        <div className="h-14 w-20 flex-shrink-0 overflow-hidden rounded-lg bg-gray-100">
                                            {banner.image ? (
                                                <img src={getImageUrl(banner.image)} alt="" className="h-full w-full object-cover" />
                                            ) : (
                                                <div className="grid h-full place-items-center text-gray-300"><FileImage size={18} /></div>
                                            )}
                                        </div>
                                        <div className="min-w-0 flex-1">
                                            <div className="flex flex-wrap items-center gap-2">
                                                <span className="text-[9px] font-black uppercase tracking-widest text-gray-400">Banner {index + 1}</span>
                                                <span className={`rounded-full px-2 py-0.5 text-[9px] font-black uppercase ${banner.active ? 'bg-emerald-50 text-emerald-600' : 'bg-gray-100 text-gray-400'}`}>
                                                    {banner.active ? 'Activo' : 'Oculto'}
                                                </span>
                                            </div>
                                            <p className="mt-1 truncate text-sm font-black text-black">{banner.title || 'Sin título'}</p>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            <button type="button" onClick={() => moveBanner(index, -1)} disabled={index === 0} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-black disabled:opacity-20" aria-label="Subir banner"><ChevronUp size={15} /></button>
                                            <button type="button" onClick={() => moveBanner(index, 1)} disabled={index === banners.length - 1} className="grid h-8 w-8 place-items-center rounded-lg text-gray-400 hover:bg-gray-50 hover:text-black disabled:opacity-20" aria-label="Bajar banner"><ChevronDown size={15} /></button>
                                            <button type="button" onClick={() => setExpandedBanners((current) => ({ ...current, [banner.id]: !expanded }))} className="grid h-9 w-9 place-items-center rounded-full bg-gray-50 text-gray-500 hover:text-black" aria-label={expanded ? 'Minimizar banner' : 'Expandir banner'}>
                                                {expanded ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                            </button>
                                        </div>
                                    </div>

                                    {expanded && (
                                        <div className="border-t border-gray-100 bg-gray-50/60 p-4 sm:p-5">
                                            <div className="grid gap-5 xl:grid-cols-[260px_1fr]">
                                                <div className="space-y-3">
                                                    <div className="aspect-[16/9] overflow-hidden rounded-xl border border-gray-200 bg-white">
                                                        {banner.image ? (
                                                            <img src={getImageUrl(banner.image)} alt={`Vista previa ${banner.title || 'banner'}`} className="h-full w-full object-cover" />
                                                        ) : (
                                                            <div className="grid h-full place-items-center text-center text-gray-300">
                                                                <div><FileImage size={26} className="mx-auto mb-2" /><span className="text-[10px] font-bold">Sin imagen</span></div>
                                                            </div>
                                                        )}
                                                    </div>
                                                    <label className="flex h-11 cursor-pointer items-center justify-center gap-2 rounded-xl border border-gray-200 bg-white text-[10px] font-black uppercase tracking-wider text-gray-600 transition hover:border-store-red hover:text-store-red">
                                                        {uploadingBannerId === banner.id ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                                        {uploadingBannerId === banner.id ? 'Cargando...' : 'Cargar imagen'}
                                                        <input
                                                            type="file"
                                                            accept="image/jpeg,image/png,image/webp"
                                                            className="hidden"
                                                            disabled={uploadingBannerId === banner.id}
                                                            onChange={(event) => void uploadBannerImage(banner.id, event.target.files?.[0])}
                                                        />
                                                    </label>
                                                    <p className="text-[9px] leading-relaxed text-gray-400">Recomendado: 1920 × 760 px, JPG/PNG/WEBP. Máximo 8 MB.</p>
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <label className="sm:col-span-2">
                                                        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-gray-500">Título principal</span>
                                                        <input
                                                            value={banner.title}
                                                            maxLength={120}
                                                            onChange={(event) => updateBanner(banner.id, 'title', event.target.value)}
                                                            className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-sm font-bold outline-none focus:border-store-red"
                                                            placeholder="Ej. Comodidad que acompaña tu ritmo"
                                                        />
                                                        <span className="mt-1 block text-right text-[9px] text-gray-400">{banner.title.length}/120 · máximo 3 líneas en portada</span>
                                                    </label>

                                                    <label>
                                                        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-gray-500">Etiqueta superior</span>
                                                        <input value={banner.eyebrow} onChange={(event) => updateBanner(banner.id, 'eyebrow', event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-store-red" placeholder="Temporada 2026" />
                                                    </label>

                                                    <label>
                                                        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-gray-500">Posición imagen</span>
                                                        <select value={banner.imagePosition} onChange={(event) => updateBanner(banner.id, 'imagePosition', event.target.value)} className="h-11 w-full rounded-xl border border-gray-200 bg-white px-3 text-xs font-semibold outline-none focus:border-store-red">
                                                            <option value="center center">Centro</option>
                                                            <option value="left center">Izquierda</option>
                                                            <option value="right center">Derecha</option>
                                                            <option value="center top">Centro arriba</option>
                                                            <option value="center bottom">Centro abajo</option>
                                                            <option value="70% center">70% horizontal</option>
                                                        </select>
                                                    </label>

                                                    <label className="sm:col-span-2">
                                                        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-gray-500">Texto descriptivo</span>
                                                        <textarea value={banner.description} maxLength={220} onChange={(event) => updateBanner(banner.id, 'description', event.target.value)} className="min-h-[82px] w-full resize-y rounded-xl border border-gray-200 bg-white p-3 text-xs font-medium leading-relaxed outline-none focus:border-store-red" placeholder="Descripción breve del banner" />
                                                    </label>

                                                    <div>
                                                        <span className="mb-1.5 block text-[9px] font-black uppercase tracking-widest text-gray-500">Color del texto</span>
                                                        <div className="flex h-11 items-center gap-3 rounded-xl border border-gray-200 bg-white px-3">
                                                            <Palette size={15} className="text-gray-400" />
                                                            <input type="color" value={banner.textColor} onChange={(event) => updateBanner(banner.id, 'textColor', event.target.value)} className="h-7 w-10 cursor-pointer border-0 bg-transparent p-0" />
                                                            <input value={banner.textColor} onChange={(event) => /^#[0-9a-fA-F]{0,6}$/.test(event.target.value) && updateBanner(banner.id, 'textColor', event.target.value)} className="min-w-0 flex-1 bg-transparent text-xs font-bold uppercase outline-none" />
                                                        </div>
                                                    </div>

                                                    <div className="flex items-end gap-3">
                                                        <label className="flex h-11 flex-1 cursor-pointer items-center justify-between rounded-xl border border-gray-200 bg-white px-3">
                                                            <span className="text-[10px] font-black uppercase tracking-wider text-gray-600">Visible</span>
                                                            <input type="checkbox" checked={banner.active} onChange={(event) => updateBanner(banner.id, 'active', event.target.checked)} className="h-4 w-4 accent-red-600" />
                                                        </label>
                                                        <button type="button" onClick={() => removeBanner(banner.id)} className="grid h-11 w-11 place-items-center rounded-xl border border-red-100 bg-red-50 text-red-500 transition hover:bg-red-100" aria-label="Eliminar banner">
                                                            <Trash2 size={16} />
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </article>
                            );
                        })}
                    </div>
                )}

                <div className="mt-5 flex flex-col gap-3 border-t border-gray-100 pt-5 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-start gap-2 text-[10px] leading-relaxed text-gray-400">
                        <AlertCircle size={13} className="mt-0.5 flex-shrink-0" />
                        <span>Los cambios se aplican en la portada al guardar y recargar la tienda. Si no existen banners personalizados activos, se conservan los banners predeterminados.</span>
                    </div>
                    <button
                        type="button"
                        onClick={saveBanners}
                        disabled={savingBanners || uploadingBannerId !== null}
                        className="flex h-11 flex-shrink-0 items-center justify-center gap-2 rounded-xl bg-black px-6 text-[10px] font-black uppercase tracking-widest text-white transition hover:bg-store-red disabled:opacity-50"
                    >
                        {savingBanners ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                        Guardar banners
                    </button>
                </div>
            </CollapsibleCard>

            <div className="hidden">{settings.homepage_banners}</div>
        </div>
    );
};

export default SettingsManager;
