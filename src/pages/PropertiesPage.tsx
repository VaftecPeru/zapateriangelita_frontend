import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'react-router-dom';
import { MapPin, Star, Bed, Bath, Square, Heart, SlidersHorizontal, Search, X, ChevronDown, Tag } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import PropertyDetails from '../components/PropertyDetails';
import { Property } from '../services/crudService';

const PropertiesPage = () => {
    const [properties, setProperties] = useState<Property[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedProperty, setSelectedProperty] = useState<Property | null>(null);
    const [searchParams] = useSearchParams();
    const { favorites, toggleFavorite, isAuthenticated } = useAuth();

    const [filters, setFilters] = useState({
        search: '',
        type: 'Todos',
        minPrice: 0,
        maxPrice: 10000,
        beds: 'Cualquiera',
        ofertasUnicas: false,
    });
    const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
    const [openDropdown, setOpenDropdown] = useState<string | null>(null);
    const filterBarRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        const handler = (e: MouseEvent) => {
            if (filterBarRef.current && !filterBarRef.current.contains(e.target as Node)) {
                setOpenDropdown(null);
            }
        };
        document.addEventListener('mousedown', handler);
        return () => document.removeEventListener('mousedown', handler);
    }, []);

    const toggleDropdown = (name: string) => setOpenDropdown(prev => prev === name ? null : name);

    useEffect(() => {
        loadData();
    }, []);

    // Sincronizar filtros con parámetros de URL (Query Params)
    useEffect(() => {
        const querySearch = searchParams.get('search');
        const queryType = searchParams.get('type');
        const queryOffer = searchParams.get('offer');

        if (querySearch || queryType || queryOffer) {
            setFilters(prev => ({
                ...prev,
                search: querySearch || prev.search,
                type: queryType || prev.type,
                ofertasUnicas: queryOffer === 'true' || prev.ofertasUnicas
            }));
        }
    }, [searchParams]);

    const loadData = async () => {
        try {
            setLoading(true);
            const propRes = await apiClient.get('/properties');
            const data = Array.isArray(propRes.data) ? propRes.data : (propRes.data.data || []);
            setProperties(data);
            setLoading(false);
        } catch (err) {
            console.error('Error loading properties:', err);
            setLoading(false);
        }
    };

    const isFavorite = (id: number) => favorites.some(p => p.id === id);

    const handleToggleFavorite = (e: React.MouseEvent, p: any) => {
        e.stopPropagation();
        if (!isAuthenticated) return;
        toggleFavorite(p);
    };

    const filteredProperties = properties.filter(p => {
        const title = (p.title || '').toLowerCase();
        const location = (p.location || '').toLowerCase();
        const search = (filters.search || '').toLowerCase();

        const matchesSearch = title.includes(search) || location.includes(search);
        const matchesType = filters.type === 'Todos' || p.type === filters.type;

        let priceValue = 0;
        if (typeof p.price === 'number') priceValue = p.price;
        else if (typeof p.price === 'string') priceValue = parseInt(String(p.price).replace(/[^0-9]/g, '')) || 0;
        const matchesPrice = priceValue >= filters.minPrice && priceValue <= filters.maxPrice;

        const bedsLimit = filters.beds === 'Cualquiera' ? 0 : parseInt(filters.beds);
        const matchesBeds = filters.beds === 'Cualquiera' || (p.beds && p.beds >= bedsLimit);

        const matchesOferta = !filters.ofertasUnicas || (p.status === 'Disponible' && (p.rating || 0) >= 4.5);

        return matchesSearch && matchesType && matchesPrice && matchesBeds && matchesOferta;
    });

    if (loading) {
        return (
            <div className="pt-32 pb-24 px-6 text-center min-h-screen">
                <div className="animate-pulse space-y-4">
                    <div className="h-10 bg-gray-200 rounded-full w-64 mx-auto mb-8" />
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-7xl mx-auto">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="h-[450px] bg-gray-100 rounded-[2.5rem]" />
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className="pt-[76px] md:pt-[96px] bg-minimal-beige min-h-screen flex flex-col">
            <div className="flex-1 flex flex-col lg:flex-row w-full 2xl:max-w-[1600px] mx-auto relative px-4 sm:px-6 lg:px-8 gap-8 pb-12">
                
                {/* Left Panel: Property List and Filters */}
                <div className="w-full lg:w-[55%] xl:w-[60%] flex flex-col pt-6 lg:pb-10">
                    
                    <div className="mb-6 md:mb-8">
                        <h1 className="text-2xl sm:text-3xl md:text-5xl font-black text-black tracking-tighter mb-1 md:mb-2 leading-tight">
                            Explorar <span className="text-minimal-gold italic">Propiedades</span>
                        </h1>
                        <p className="text-xs sm:text-sm md:text-base text-gray-500 font-medium whitespace-normal">Encuentra el espacio perfecto para tu próxima estancia.</p>
                    </div>

                    <div className="mb-6" ref={filterBarRef}>
                        <div className="hidden md:flex items-center bg-white border border-gray-200 rounded-full shadow-md divide-x divide-gray-200 overflow-visible">
                            {/* ... (Filters) ... */}
                            <div className="flex items-center gap-2 px-5 py-3 flex-1 min-w-0">
                                <MapPin size={15} className="text-gray-400 shrink-0" />
                                <input
                                    type="text"
                                    placeholder="Ciudad o nombre..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="bg-transparent text-xs font-bold text-gray-700 placeholder-gray-400 outline-none w-full"
                                />
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('tipo')}
                                    className={`px-5 py-3 flex items-center gap-2 transition-colors text-left ${openDropdown === 'tipo' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Tipo de estancia</p>
                                        <p className="text-xs font-bold text-gray-900">{filters.type}</p>
                                    </div>
                                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${openDropdown === 'tipo' ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === 'tipo' && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 min-w-[160px]">
                                        {['Todos', 'Departamento', 'Habitación', 'Estudio'].map(t => (
                                            <button key={t}
                                                onClick={() => { setFilters({ ...filters, type: t }); setOpenDropdown(null); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filters.type === t ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                                {t}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('beds')}
                                    className={`px-5 py-3 flex items-center gap-2 transition-colors text-left ${openDropdown === 'beds' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Dormitorios</p>
                                        <p className="text-xs font-bold text-gray-900">{filters.beds === 'Cualquiera' ? 'Cualquier número' : `${filters.beds} hab.`}</p>
                                    </div>
                                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${openDropdown === 'beds' ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === 'beds' && (
                                    <div className="absolute top-[calc(100%+8px)] left-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-2 min-w-[150px]">
                                        {['Cualquiera', '1', '2', '3+'].map(n => (
                                            <button key={n}
                                                onClick={() => { setFilters({ ...filters, beds: n }); setOpenDropdown(null); }}
                                                className={`w-full text-left px-4 py-2.5 rounded-xl text-xs font-bold transition-all ${filters.beds === n ? 'bg-black text-white' : 'text-gray-600 hover:bg-gray-100'}`}>
                                                {n === 'Cualquiera' ? 'Cualquier número' : `${n} habitación${n === '1' ? '' : 'es'}`}
                                            </button>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <div className="relative">
                                <button
                                    onClick={() => toggleDropdown('precio')}
                                    className={`px-5 py-3 flex items-center gap-2 transition-colors text-left ${openDropdown === 'precio' ? 'bg-gray-50' : 'hover:bg-gray-50'}`}
                                >
                                    <div>
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest whitespace-nowrap">Presupuesto máx.</p>
                                        <p className="text-xs font-bold text-gray-900">S/{filters.maxPrice.toLocaleString()}</p>
                                    </div>
                                    <ChevronDown size={13} className={`text-gray-400 transition-transform ${openDropdown === 'precio' ? 'rotate-180' : ''}`} />
                                </button>
                                {openDropdown === 'precio' && (
                                    <div className="absolute top-[calc(100%+8px)] right-0 z-50 bg-white border border-gray-100 rounded-2xl shadow-xl p-5 min-w-[240px]">
                                        <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-4">Presupuesto máximo mensual</p>
                                        <input
                                            type="range" min="0" max="10000" step="500"
                                            value={filters.maxPrice}
                                            onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                            className="w-full accent-black h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer mb-3"
                                        />
                                        <div className="flex justify-between text-[10px] font-bold text-gray-400">
                                            <span>S/0</span>
                                            <span className="text-black font-black text-sm">S/{filters.maxPrice.toLocaleString()}</span>
                                            <span>S/10,000</span>
                                        </div>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={() => setOpenDropdown(null)}
                                className="bg-black text-white px-6 py-4 flex items-center gap-2 hover:bg-gray-900 transition-colors font-bold text-xs rounded-r-full"
                            >
                                <Search size={15} />
                                Buscar
                            </button>
                        </div>

                        <div className="md:hidden flex gap-2 sm:gap-3">
                            <div className="flex-1 flex items-center gap-2 bg-white border border-gray-200 rounded-full px-4 sm:px-5 py-2.5 sm:py-3 shadow-sm">
                                <Search size={14} className="text-gray-400" />
                                <input
                                    type="text"
                                    placeholder="Buscar..."
                                    value={filters.search}
                                    onChange={(e) => setFilters({ ...filters, search: e.target.value })}
                                    className="bg-transparent text-[11px] sm:text-xs font-bold text-gray-700 placeholder-gray-400 outline-none w-full"
                                />
                            </div>
                            <button onClick={() => setMobileFiltersOpen(!mobileFiltersOpen)}
                                className="bg-black text-white rounded-full px-4 sm:px-5 py-2.5 sm:py-3 flex items-center gap-2 text-[11px] sm:text-xs font-black shrink-0">
                                <SlidersHorizontal size={13} /> S/ {filters.maxPrice.toLocaleString()}
                            </button>
                        </div>

                        {mobileFiltersOpen && (
                            <div className="md:hidden mt-4 bg-white border border-gray-100 rounded-3xl shadow-xl p-6 space-y-6">
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Tipo de Estancia</p>
                                    <div className="flex flex-wrap gap-2">
                                        {['Todos', 'Departamento', 'Habitación', 'Estudio'].map(t => (
                                            <button key={t} onClick={() => setFilters({ ...filters, type: t })}
                                                className={`px-4 py-2 rounded-full text-xs font-bold transition-all ${filters.type === t ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>{t}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Habitaciones</p>
                                    <div className="flex gap-2">
                                        {['Cualquiera', '1', '2', '3+'].map(n => (
                                            <button key={n} onClick={() => setFilters({ ...filters, beds: n })}
                                                className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${filters.beds === n ? 'bg-black text-white' : 'bg-gray-100 text-gray-500'}`}>{n}</button>
                                        ))}
                                    </div>
                                </div>
                                <div>
                                    <p className="text-[10px] font-black text-gray-400 uppercase tracking-widest mb-3">Presupuesto Máx: S/{filters.maxPrice.toLocaleString()}</p>
                                    <input type="range" min="0" max="10000" step="500" value={filters.maxPrice}
                                        onChange={(e) => setFilters({ ...filters, maxPrice: parseInt(e.target.value) })}
                                        className="w-full accent-black h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer" />
                                </div>
                                <button onClick={() => setFilters({ search: '', type: 'Todos', minPrice: 0, maxPrice: 10000, beds: 'Cualquiera', ofertasUnicas: false })}
                                    className="text-[10px] font-black text-red-400 uppercase tracking-widest hover:text-red-600 transition-colors">
                                    Limpiar Filtros
                                </button>
                            </div>
                        )}

                        <div className="flex items-center gap-4 mt-4 flex-wrap">
                            <button
                                onClick={() => setFilters({ ...filters, ofertasUnicas: !filters.ofertasUnicas })}
                                className={`flex items-center gap-2 px-4 py-2 rounded-full border text-xs font-bold transition-all ${filters.ofertasUnicas ? 'bg-minimal-gold border-minimal-gold text-black shadow-sm' : 'bg-white border-gray-200 text-gray-600 hover:border-gray-400'}`}
                            >
                                <Tag size={13} />
                                Ofertas Únicas
                            </button>

                            {(filters.search || filters.type !== 'Todos' || filters.maxPrice < 10000 || filters.beds !== 'Cualquiera' || filters.ofertasUnicas) && (
                                <button
                                    onClick={() => setFilters({ search: '', type: 'Todos', minPrice: 0, maxPrice: 10000, beds: 'Cualquiera', ofertasUnicas: false })}
                                    className="flex items-center gap-1.5 px-4 py-2 rounded-full border border-red-200 text-red-500 text-xs font-bold hover:bg-red-50 transition-all"
                                >
                                    <X size={13} /> Limpiar
                                </button>
                            )}

                            <p className="text-xs font-bold text-gray-400 ml-auto">{filteredProperties.length} propiedades</p>
                        </div>
                    </div>

                    {filteredProperties.length === 0 ? (
                        <div className="bg-white rounded-[2.5rem] border border-black border-dashed p-20 text-center">
                            <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                <X size={32} className="text-gray-200" />
                            </div>
                            <h3 className="text-xl font-black text-black mb-2">No hay resultados</h3>
                            <p className="text-gray-500 font-medium max-w-xs mx-auto">Prueba ajustando los filtros para ver más opciones.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 pb-10">
                            {filteredProperties.map((p) => (
                                <div
                                    key={p.id}
                                    onClick={() => setSelectedProperty(p)}
                                    className="flex flex-col group bg-white rounded-2xl overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-300 cursor-pointer"
                                >
                                    <div className="relative aspect-[4/3] overflow-hidden rounded-2xl">
                                        <img
                                            src={p.img || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800'}
                                            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                                            alt={p.title}
                                            onError={(e: any) => { e.target.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800'; }}
                                        />
                                        <div className="absolute top-3 left-3">
                                            <span className="bg-white/90 backdrop-blur-sm text-gray-700 text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest shadow-sm">{p.type}</span>
                                        </div>
                                        <div className="absolute top-3 right-3">
                                            <span className={`text-[10px] font-black px-3 py-1.5 rounded-full uppercase tracking-widest text-white shadow-sm ${p.status === 'Disponible' ? 'bg-minimal-olive' : 'bg-gray-400'}`}>{p.status}</span>
                                        </div>
                                        <button onClick={(e) => handleToggleFavorite(e, p)}
                                            className="absolute bottom-3 right-3 p-2 bg-white/90 backdrop-blur-sm rounded-full shadow-sm transition-all hover:scale-110 active:scale-90 cursor-pointer">
                                            <Heart size={16} className={`${p.id !== undefined && isFavorite(p.id) ? 'text-red-500 fill-red-500' : 'text-gray-500'} transition-all`} />
                                        </button>
                                    </div>
                                    <div className="pt-4 pb-2 pl-6 pr-4 flex flex-col flex-grow">
                                        <div className="flex justify-between items-start gap-2 mb-1">
                                            <h3 className="text-base font-bold text-gray-900 leading-tight line-clamp-2 flex-1 tracking-tighter">{p.title}</h3>
                                            <div className="flex items-center gap-0.5 shrink-0">
                                                {[...Array(5)].map((_, i) => (
                                                    <Star key={i} size={12} className={`${i < Math.round(p.rating || 0) ? 'text-[#FFC107] fill-[#FFC107]' : 'text-gray-200 fill-gray-200'}`} />
                                                ))}
                                                <span className="text-[10px] font-black text-black ml-1.5">{p.rating}</span>
                                            </div>
                                        </div>
                                        <div className="flex items-center gap-1.5 text-gray-400 text-xs font-semibold mb-3">
                                            <MapPin className="text-minimal-gold w-3 h-3 shrink-0" />
                                            <span className="truncate">{p.location}</span>
                                        </div>
                                        <div className="flex items-center gap-4 text-gray-500 text-xs font-semibold mb-4 border-t border-gray-100 pt-3">
                                            <span className="flex items-center gap-2"><Bed size={14} className="text-gray-400" /> {p.beds} hab.</span>
                                            <span className="flex items-center gap-2"><Bath size={14} className="text-gray-400" /> {p.baths} baños</span>
                                            <span className="flex items-center gap-2"><Square size={14} className="text-gray-400" /> {p.area}</span>
                                        </div>
                                        <div className="flex items-center gap-2 mt-auto flex-wrap">
                                            <div className="flex items-baseline gap-1">
                                                <span className="text-xs text-gray-400 font-semibold">desde</span>
                                                {p.discounted_price && Number(p.discounted_price) > 0 ? (
                                                    <div className="flex items-center gap-1.5">
                                                        <span className="text-sm text-gray-400 font-semibold line-through">S/{Number(p.price).toFixed(2)}</span>
                                                        <span className="text-xl font-black text-gray-900">S/{Number(p.discounted_price).toFixed(2)}</span>
                                                    </div>
                                                ) : (
                                                    <span className="text-xl font-black text-black">S/{Number(p.price).toFixed(2)}</span>
                                                )}
                                                <span className="text-xs text-gray-400 font-semibold">/mes</span>
                                            </div>
                                            {p.discounted_price && Number(p.discounted_price) > 0 && (
                                                <span className="text-xs font-black px-2.5 py-1 rounded-lg text-white bg-red-500 shadow-sm">
                                                    -{(((Number(p.price) - Number(p.discounted_price)) / Number(p.price)) * 100).toFixed(0)}%
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>

                {/* Right Panel: Sticky Map */}
                <div className="hidden lg:block lg:w-[45%] xl:w-[40%] relative pt-6">
                    <div className="sticky top-[120px] h-[calc(100vh-140px)] w-full rounded-[2.5rem] overflow-hidden shadow-inner border border-gray-200 bg-[#E3E2E0] relative">
                        {/* Base simulada del mapa con un tono más "realista" */}
                        <div className="absolute inset-0 bg-[#E3E2E0]" style={{ backgroundImage: 'radial-gradient(#CFCFCF 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
                            
                            {/* Calles principales */}
                            <div className="absolute top-1/4 left-0 right-0 h-10 bg-white/60 transform -rotate-12 border-y border-white/80"></div>
                            <div className="absolute top-1/2 left-0 right-0 h-10 bg-white/60 transform rotate-6 border-y border-white/80"></div>
                            <div className="absolute top-0 bottom-0 left-1/3 w-14 bg-white/60 transform rotate-12 border-x border-white/80"></div>
                            <div className="absolute top-0 bottom-0 left-[60%] w-10 bg-white/60 transform -rotate-3 border-x border-white/80"></div>

                            {/* Áreas Verdes (Parques) */}
                            <div className="absolute top-[15%] right-[15%] w-32 h-32 bg-[#CFDBC5] rounded-[30% 70% 70% 30% / 30% 30% 70% 70%] border border-[#B8C7AD] opacity-70"></div>
                            <div className="absolute bottom-[20%] left-[10%] w-40 h-24 bg-[#CFDBC5] rounded-[60% 40% 30% 70% / 60% 30% 70% 40%] border border-[#B8C7AD] opacity-70"></div>

                            {/* Cuerpos de Agua */}
                            <div className="absolute -bottom-10 -right-20 w-64 h-64 bg-[#D4E2EC] rounded-full border border-[#BDD1DE] opacity-60"></div>
                            
                            {/* Etiquetas de Áreas */}
                            <p className="absolute top-[35%] left-[45%] text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] select-none opacity-40">Distrito Centro</p>
                            <p className="absolute bottom-[40%] right-[15%] text-[9px] font-black text-gray-400 uppercase tracking-[0.2em] select-none opacity-40">Zona Residencial</p>
                            <p className="absolute top-[20%] right-[20%] text-[8px] font-bold text-[#8FA47F] uppercase tracking-[0.1em] select-none">Parque Homad</p>
                        </div>

                        {/* Marcadores de precio silulados e interactivos */}
                        {filteredProperties.slice(0, 10).map((p, idx) => {
                            const positions = [
                                { top: '22%', left: '28%' }, { top: '38%', right: '22%' },
                                { bottom: '35%', left: '38%' }, { top: '65%', left: '18%' },
                                { bottom: '18%', right: '28%' }, { top: '15%', right: '45%' },
                                { top: '45%', left: '15%' }, { bottom: '45%', right: '35%' },
                                { top: '10%', right: '15%' }, { bottom: '15%', left: '15%' }
                            ];
                            const pos = positions[idx % positions.length];
                            return (
                                <div 
                                    key={`map-pin-${p.id}`} 
                                    onClick={() => setSelectedProperty(p)}
                                    className="absolute z-10 cursor-pointer transform hover:scale-110 hover:z-30 transition-all bg-black text-white px-3.5 py-2 rounded-xl text-[11px] font-black shadow-[0_8px_16px_rgba(0,0,0,0.2)] border-[2.5px] border-white group animate-in fade-in zoom-in duration-500 hover:shadow-[0_12px_24px_rgba(0,0,0,0.3)]"
                                    style={pos}
                                >
                                    <div className="flex items-center gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-minimal-gold animate-pulse group-hover:scale-125"></div>
                                        S/{Number(p.discounted_price && Number(p.discounted_price) > 0 ? p.discounted_price : p.price).toLocaleString()}
                                    </div>
                                    <div className="absolute -bottom-1.5 left-1/2 -ml-1.5 w-3 h-3 bg-black rotate-45 border-r-[2.5px] border-b-[2.5px] border-white z-[-1]"></div>
                                </div>
                            );
                        })}
                    </div>
                </div>




            </div>

            {selectedProperty && (
                <PropertyDetails
                    property={selectedProperty}
                    allProperties={properties}
                    onClose={() => setSelectedProperty(null)}
                    onSelectProperty={(p) => setSelectedProperty(p)}
                />
            )}
        </div>
    );
};

export default PropertiesPage;