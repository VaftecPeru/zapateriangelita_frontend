import { useEffect, useState } from 'react';
import {
    ChevronDown,
    ChevronUp,
    Image as ImageIcon,
    Loader2,
    Plus,
    Save,
    Trash2,
    Upload,
} from 'lucide-react';
import { settingsService } from '../../services/crudService';
import { getImageUrl } from '../../config/api';

type HeroBanner = {
    id: string;
    eyebrow: string;
    title: string;
    description: string;
    image: string;
    imagePosition: string;
    textColor: string;
    active: boolean;
};

const fallbackBanners: HeroBanner[] = [
    {
        id: 'banner-1',
        eyebrow: 'Colección Angelita',
        title: 'Pasos que unen a la familia',
        description: 'Calzado para cada etapa, para cada historia. Comodidad, estilo y calidad en un solo lugar.',
        image: '',
        imagePosition: '70% center',
        textColor: '#ffffff',
        active: true,
    },
    {
        id: 'banner-2',
        eyebrow: 'Temporada 2026',
        title: 'Comodidad que acompaña tu ritmo',
        description: 'Diseños ligeros, versátiles y listos para todos tus planes.',
        image: '',
        imagePosition: '72% center',
        textColor: '#ffffff',
        active: true,
    },
    {
        id: 'banner-3',
        eyebrow: 'Para toda la familia',
        title: 'Grandes historias comienzan con buenos pasos',
        description: 'Encuentra el par ideal para mujer, hombre, niñas y niños.',
        image: '',
        imagePosition: '68% center',
        textColor: '#ffffff',
        active: true,
    },
];

const normalizeBanner = (banner: any, index: number): HeroBanner => ({
    id: String(banner?.id || `banner-${index + 1}`),
    eyebrow: String(banner?.eyebrow || ''),
    title: String(banner?.title || ''),
    description: String(banner?.description || ''),
    image: String(banner?.image || ''),
    imagePosition: String(banner?.imagePosition || 'center center'),
    textColor: /^#[0-9a-f]{6}$/i.test(String(banner?.textColor || '')) ? String(banner.textColor) : '#ffffff',
    active: banner?.active !== false,
});

export default function BannerSettingsSection() {
    const [sectionOpen, setSectionOpen] = useState(true);
    const [banners, setBanners] = useState<HeroBanner[]>(fallbackBanners);
    const [openCards, setOpenCards] = useState<Record<string, boolean>>({ 'banner-1': true });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [uploadingId, setUploadingId] = useState<string | null>(null);
    const [message, setMessage] = useState<{ type: 'success' | 'error'; text: string } | null>(null);

    useEffect(() => {
        const load = async () => {
            try {
                const response = await settingsService.getAll();
                const raw = response.data.data?.hero_banners;
                if (!raw) return;

                const parsed = typeof raw === 'string' ? JSON.parse(raw) : raw;
                if (Array.isArray(parsed) && parsed.length) {
                    setBanners(parsed.map(normalizeBanner));
                }
            } catch (error) {
                console.error('Error loading hero banners:', error);
                setMessage({ type: 'error', text: 'No se pudieron cargar los banners guardados.' });
            } finally {
                setLoading(false);
            }
        };
        void load();
    }, []);

    const updateBanner = (id: string, patch: Partial<HeroBanner>) => {
        setBanners((current) => current.map((banner) => banner.id === id ? { ...banner, ...patch } : banner));
    };

    const addBanner = () => {
        const id = `banner-${Date.now()}`;
        const newBanner: HeroBanner = {
            id,
            eyebrow: 'Nueva colección',
            title: 'Nuevo banner de portada',
            description: 'Agrega un mensaje breve para acompañar esta promoción.',
            image: '',
            imagePosition: 'center center',
            textColor: '#ffffff',
            active: true,
        };
        setBanners((current) => [...current, newBanner]);
        setOpenCards((current) => ({ ...current, [id]: true }));
    };

    const removeBanner = (id: string) => {
        setBanners((current) => current.filter((banner) => banner.id !== id));
    };

    const moveBanner = (index: number, direction: -1 | 1) => {
        setBanners((current) => {
            const target = index + direction;
            if (target < 0 || target >= current.length) return current;
            const next = [...current];
            [next[index], next[target]] = [next[target], next[index]];
            return next;
        });
    };

    const uploadImage = async (banner: HeroBanner, file?: File) => {
        if (!file) return;
        if (!file.type.startsWith('image/')) {
            setMessage({ type: 'error', text: 'Selecciona un archivo de imagen válido.' });
            return;
        }
        if (file.size > 6 * 1024 * 1024) {
            setMessage({ type: 'error', text: 'La imagen no debe superar 6 MB.' });
            return;
        }

        try {
            setUploadingId(banner.id);
            setMessage(null);
            const response = await settingsService.uploadBannerImage(file);
            const path = response.data?.data?.path || response.data?.path;
            if (!path) throw new Error('El servidor no devolvió la ruta de la imagen.');
            updateBanner(banner.id, { image: path });
            setMessage({ type: 'success', text: 'Imagen cargada. Guarda los banners para publicarla.' });
        } catch (error: any) {
            console.error('Error uploading banner image:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'No se pudo cargar la imagen.' });
        } finally {
            setUploadingId(null);
        }
    };

    const save = async () => {
        if (!banners.length) {
            setMessage({ type: 'error', text: 'Debe existir al menos un banner.' });
            return;
        }
        if (banners.some((banner) => !banner.title.trim())) {
            setMessage({ type: 'error', text: 'Todos los banners deben tener un título.' });
            return;
        }
        if (!banners.some((banner) => banner.active)) {
            setMessage({ type: 'error', text: 'Debe existir al menos un banner activo.' });
            return;
        }

        try {
            setSaving(true);
            setMessage(null);
            const clean = banners.map((banner) => ({
                ...banner,
                eyebrow: banner.eyebrow.trim(),
                title: banner.title.trim(),
                description: banner.description.trim(),
                textColor: banner.textColor || '#ffffff',
                imagePosition: banner.imagePosition || 'center center',
            }));
            await settingsService.update('hero_banners', JSON.stringify(clean));
            setBanners(clean);
            setMessage({ type: 'success', text: 'Banners guardados correctamente. La portada usará esta configuración.' });
        } catch (error: any) {
            console.error('Error saving banners:', error);
            setMessage({ type: 'error', text: error.response?.data?.message || 'No se pudieron guardar los banners.' });
        } finally {
            setSaving(false);
        }
    };

    return (
        <section className="rounded-3xl border border-gray-100 bg-white overflow-hidden">
            <button
                type="button"
                onClick={() => setSectionOpen((value) => !value)}
                className="w-full flex items-center justify-between gap-4 px-5 sm:px-7 py-5 text-left hover:bg-gray-50 transition-colors"
                aria-expanded={sectionOpen}
            >
                <div className="flex items-center gap-3">
                    <span className="w-10 h-10 rounded-2xl bg-red-50 text-store-red flex items-center justify-center">
                        <ImageIcon size={19} />
                    </span>
                    <div>
                        <h3 className="text-xs sm:text-sm font-black uppercase tracking-widest text-black">Banners de portada</h3>
                        <p className="mt-1 text-[10px] text-gray-400 font-bold uppercase tracking-wide">Imagen, texto, color y orden del slider</p>
                    </div>
                </div>
                {sectionOpen ? <ChevronUp size={19} /> : <ChevronDown size={19} />}
            </button>

            {sectionOpen && (
                <div className="border-t border-gray-100 p-5 sm:p-7 space-y-5">
                    {message && (
                        <div className={`rounded-2xl px-4 py-3 text-xs font-bold ${message.type === 'success' ? 'bg-emerald-50 text-emerald-700' : 'bg-red-50 text-red-700'}`}>
                            {message.text}
                        </div>
                    )}

                    <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <p className="text-xs text-gray-500 leading-relaxed max-w-2xl">
                            El título se mostrará con un máximo visual de <strong>3 líneas</strong>. Para mayor contraste se recomienda texto blanco.
                        </p>
                        <button type="button" onClick={addBanner} className="inline-flex items-center justify-center gap-2 rounded-xl border border-gray-200 px-4 py-2.5 text-[10px] font-black uppercase tracking-widest hover:border-store-red hover:text-store-red transition-colors">
                            <Plus size={14} /> Nuevo banner
                        </button>
                    </div>

                    {loading ? (
                        <div className="py-10 flex items-center justify-center gap-2 text-xs text-gray-400"><Loader2 className="animate-spin" size={17} /> Cargando banners...</div>
                    ) : (
                        <div className="space-y-3">
                            {banners.map((banner, index) => {
                                const open = Boolean(openCards[banner.id]);
                                return (
                                    <article key={banner.id} className="rounded-2xl border border-gray-200 overflow-hidden bg-gray-50/50">
                                        <div className="flex items-center gap-3 p-4 bg-white">
                                            <button type="button" onClick={() => setOpenCards((current) => ({ ...current, [banner.id]: !open }))} className="flex-1 flex items-center gap-3 text-left min-w-0" aria-expanded={open}>
                                                <span className="w-8 h-8 rounded-xl bg-gray-100 flex items-center justify-center text-xs font-black">{index + 1}</span>
                                                <div className="min-w-0">
                                                    <strong className="block truncate text-sm text-black">{banner.title || 'Banner sin título'}</strong>
                                                    <span className="text-[10px] text-gray-400">{banner.active ? 'Publicado' : 'Oculto'}</span>
                                                </div>
                                            </button>
                                            <button type="button" onClick={() => moveBanner(index, -1)} disabled={index === 0} className="px-2 py-1 text-xs disabled:opacity-30" aria-label="Subir banner">↑</button>
                                            <button type="button" onClick={() => moveBanner(index, 1)} disabled={index === banners.length - 1} className="px-2 py-1 text-xs disabled:opacity-30" aria-label="Bajar banner">↓</button>
                                            <button type="button" onClick={() => removeBanner(banner.id)} disabled={banners.length <= 1} className="p-2 text-gray-400 hover:text-red-600 disabled:opacity-30" aria-label="Eliminar banner"><Trash2 size={16} /></button>
                                            <button type="button" onClick={() => setOpenCards((current) => ({ ...current, [banner.id]: !open }))} className="p-2" aria-label={open ? 'Minimizar banner' : 'Abrir banner'}>{open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}</button>
                                        </div>

                                        {open && (
                                            <div className="p-4 sm:p-5 grid gap-5 lg:grid-cols-[240px_1fr]">
                                                <div className="space-y-3">
                                                    <div className="aspect-[16/10] rounded-2xl bg-gray-100 overflow-hidden border border-gray-200 flex items-center justify-center">
                                                        {banner.image ? <img src={getImageUrl(banner.image)} alt="Vista previa del banner" className="w-full h-full object-cover" /> : <ImageIcon className="text-gray-300" size={36} />}
                                                    </div>
                                                    <label className="w-full cursor-pointer inline-flex items-center justify-center gap-2 rounded-xl bg-black text-white px-4 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-store-red transition-colors">
                                                        {uploadingId === banner.id ? <Loader2 size={15} className="animate-spin" /> : <Upload size={15} />}
                                                        {uploadingId === banner.id ? 'Subiendo...' : 'Cambiar imagen'}
                                                        <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" disabled={uploadingId === banner.id} onChange={(event) => void uploadImage(banner, event.target.files?.[0])} />
                                                    </label>
                                                    <input value={banner.image} onChange={(event) => updateBanner(banner.id, { image: event.target.value })} placeholder="o pega una URL/ruta de imagen" className="w-full rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-xs outline-none focus:border-store-red" />
                                                </div>

                                                <div className="grid gap-4 sm:grid-cols-2">
                                                    <label className="space-y-1.5 sm:col-span-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Etiqueta superior</span>
                                                        <input maxLength={45} value={banner.eyebrow} onChange={(event) => updateBanner(banner.id, { eyebrow: event.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-store-red" />
                                                    </label>
                                                    <label className="space-y-1.5 sm:col-span-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Título · máximo visual 3 líneas</span>
                                                        <textarea rows={3} maxLength={95} value={banner.title} onChange={(event) => updateBanner(banner.id, { title: event.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm font-bold outline-none focus:border-store-red resize-none" />
                                                    </label>
                                                    <label className="space-y-1.5 sm:col-span-2">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Texto complementario</span>
                                                        <textarea rows={2} maxLength={150} value={banner.description} onChange={(event) => updateBanner(banner.id, { description: event.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-sm outline-none focus:border-store-red resize-none" />
                                                    </label>
                                                    <label className="space-y-1.5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Color del texto</span>
                                                        <div className="flex items-center gap-2 rounded-xl border border-gray-200 bg-white px-3 py-2">
                                                            <input type="color" value={banner.textColor} onChange={(event) => updateBanner(banner.id, { textColor: event.target.value })} className="w-9 h-9 rounded border-0 bg-transparent" />
                                                            <input value={banner.textColor} maxLength={7} onChange={(event) => updateBanner(banner.id, { textColor: event.target.value })} className="min-w-0 flex-1 text-xs outline-none" />
                                                        </div>
                                                    </label>
                                                    <label className="space-y-1.5">
                                                        <span className="text-[10px] font-black uppercase tracking-widest text-gray-500">Posición de imagen</span>
                                                        <select value={banner.imagePosition} onChange={(event) => updateBanner(banner.id, { imagePosition: event.target.value })} className="w-full rounded-xl border border-gray-200 bg-white px-3 py-3 text-xs outline-none focus:border-store-red">
                                                            <option value="center center">Centro</option>
                                                            <option value="70% center">Derecha suave</option>
                                                            <option value="80% center">Derecha</option>
                                                            <option value="30% center">Izquierda</option>
                                                            <option value="center top">Superior</option>
                                                        </select>
                                                    </label>
                                                    <label className="sm:col-span-2 flex items-center justify-between gap-4 rounded-xl border border-gray-200 bg-white px-4 py-3">
                                                        <span className="text-xs font-bold text-gray-700">Mostrar este banner en la portada</span>
                                                        <input type="checkbox" checked={banner.active} onChange={(event) => updateBanner(banner.id, { active: event.target.checked })} className="w-5 h-5 accent-red-600" />
                                                    </label>
                                                </div>
                                            </div>
                                        )}
                                    </article>
                                );
                            })}
                        </div>
                    )}

                    <div className="flex justify-end pt-2">
                        <button type="button" onClick={save} disabled={saving || loading} className="inline-flex items-center justify-center gap-2 rounded-xl bg-store-red text-white px-5 py-3 text-[10px] font-black uppercase tracking-widest hover:bg-red-700 transition-colors disabled:opacity-50">
                            {saving ? <Loader2 size={15} className="animate-spin" /> : <Save size={15} />}
                            {saving ? 'Guardando...' : 'Guardar banners'}
                        </button>
                    </div>
                </div>
            )}
        </section>
    );
}
