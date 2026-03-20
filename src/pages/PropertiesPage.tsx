import { useState, useEffect } from 'react';
import { MapPin, Star, Bed, Bath, Square, Heart, ChevronRight, SlidersHorizontal, Search, X } from 'lucide-react';
import { useAuth } from '../hooks/useAuth';
import apiClient from '../services/apiClient';
import PropertyDetails from '../components/PropertyDetails';

const PropertiesPage = () => {
    const [properties, setProperties] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [isFilterOpen, setIsFilterOpen] = useState(false);
    const [selectedProperty, setSelectedProperty] = useState<any>(null);
    const { favorites, toggleFavorite, isAuthenticated } = useAuth();
    
    // Filters state
    const [filters, setFilters] = useState({
        search: '',
        type: 'Todos',
        minPrice: 0,
        maxPrice: 10000,
        beds: 'Cualquiera'
    });

    useEffect(() => {
        loadProperties();
    }, []);

    const loadProperties = async () => {
        try {
            setLoading(true);
            const response = await apiClient.get('/properties');
            setProperties(response.data);
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
        
        const matchesType = filters.type === 'Todos' || p.type === (filters.type === 'Habitaciones' ? 'Habitación' : 'Apartamento');
        
        // Safety check for price: could be number or string
        let priceValue = 0;
        if (typeof p.price === 'number') {
            priceValue = p.price;
        } else if (typeof p.price === 'string') {
            priceValue = parseInt(p.price.replace(/[^0-9]/g, '')) || 0;
        }
        
        const matchesPrice = priceValue >= filters.minPrice && priceValue <= filters.maxPrice;
        
        const bedsLimit = filters.beds === 'Cualquiera' ? 0 : parseInt(filters.beds);
        const matchesBeds = filters.beds === 'Cualquiera' || (p.beds && p.beds >= bedsLimit);

        return matchesSearch && matchesType && matchesPrice && matchesBeds;
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
        <div className="pt-32 pb-20 px-6 min-h-screen bg-minimal-beige">
            <div className="max-w-7xl mx-auto">
                <div className="flex justify-between items-end mb-12">
                    <div>
                        <h1 className="text-4xl md:text-6xl font-black text-black tracking-tighter mb-4">
                            Explorar <span className="text-minimal-olive italic">Propiedades</span>
                        </h1>
                        <p className="text-gray-500 font-medium">
                            Encuentra el espacio perfecto que se adapte a tus necesidades.
                        </p>
                    </div>
                    
                    <button 
                        onClick={() => setIsFilterOpen(!isFilterOpen)}
                        className="md:hidden flex items-center gap-2 px-6 py-3 bg-black text-white rounded-xl font-black text-xs uppercase tracking-widest active:scale-95 transition-all"
                    >
                        <SlidersHorizontal size={16} />
                        Filtros
                    </button>
                </div>

                <div className="flex flex-col md:flex-row gap-10">
                    {/* Sidebar Filters */}
                    <aside className={`md:w-72 space-y-8 h-fit md:sticky md:top-32 ${isFilterOpen ? 'block' : 'hidden md:block'}`}>
                        <div className="bg-white p-8 rounded-[2.5rem] border border-black shadow-sm space-y-10">
                            {/* Search */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Búsqueda</label>
                                <div className="relative">
                                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                                    <input 
                                        type="text" 
                                        placeholder="Ciudad o nombre..."
                                        value={filters.search}
                                        onChange={(e) => setFilters({...filters, search: e.target.value})}
                                        className="w-full pl-12 pr-4 py-3.5 bg-gray-50 border border-black/5 rounded-2xl text-xs font-bold outline-none focus:ring-2 focus:ring-minimal-olive/20 transition-all"
                                    />
                                </div>
                            </div>

                            {/* Type */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Tipo de Estancia</label>
                                <div className="flex flex-col gap-2">
                                    {['Todos', 'Habitaciones', 'Departamentos'].map((t) => (
                                        <button
                                            key={t}
                                            onClick={() => setFilters({...filters, type: t})}
                                            className={`px-5 py-3 rounded-2xl text-xs font-bold text-left transition-all hover:translate-x-1 ${filters.type === t ? 'bg-black text-white' : 'bg-gray-50 text-gray-400 hover:text-black active:scale-95'}`}
                                        >
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Presupuesto Máx.</label>
                                <div className="space-y-4">
                                    <input 
                                        type="range" 
                                        min="0" 
                                        max="10000" 
                                        step="500"
                                        value={filters.maxPrice}
                                        onChange={(e) => setFilters({...filters, maxPrice: parseInt(e.target.value)})}
                                        className="w-full accent-minimal-olive h-1.5 bg-gray-100 rounded-lg appearance-none cursor-pointer"
                                    />
                                    <div className="flex justify-between items-center bg-gray-50 p-3 rounded-xl border border-black/5">
                                        <span className="text-[10px] font-black text-gray-400 uppercase">Hasta</span>
                                        <span className="text-sm font-black text-black">S/{filters.maxPrice.toLocaleString()}</span>
                                    </div>
                                </div>
                            </div>

                            {/* Beds */}
                            <div className="space-y-4">
                                <label className="text-[10px] font-black text-black uppercase tracking-[0.2em]">Dormitorios</label>
                                <div className="grid grid-cols-4 gap-2">
                                    {['Cualquiera', '1', '2', '3+'].map((n) => (
                                        <button
                                            key={n}
                                            onClick={() => setFilters({...filters, beds: n})}
                                            className={`h-10 rounded-xl text-[10px] font-black transition-all ${filters.beds === n ? 'bg-minimal-olive text-white' : 'bg-gray-50 text-gray-400 hover:text-black hover:bg-gray-100 active:scale-90'}`}
                                        >
                                            {n}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <button 
                                onClick={() => setFilters({search: '', type: 'Todos', minPrice: 0, maxPrice: 10000, beds: 'Cualquiera'})}
                                className="w-full py-4 text-[10px] font-black text-gray-400 uppercase tracking-widest hover:text-red-500 transition-colors"
                            >
                                Limpiar Filtros
                            </button>
                        </div>
                    </aside>

                    {/* Results Grid */}
                    <main className="flex-1">
                        {filteredProperties.length === 0 ? (
                            <div className="bg-white rounded-[2.5rem] border border-black border-dashed p-20 text-center">
                                <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mx-auto mb-6">
                                    <X size={32} className="text-gray-200" />
                                </div>
                                <h3 className="text-xl font-black text-black mb-2">No hay resultados</h3>
                                <p className="text-gray-500 font-medium max-w-xs mx-auto">Prueba ajustando los filtros para ver más opciones.</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 md:gap-8">
                                {filteredProperties.map((p) => (
                                    <div
                                        key={p.id}
                                        onClick={() => setSelectedProperty(p)}
                                        className="group bg-white rounded-[1.2rem] md:rounded-[1.5rem] overflow-hidden border border-black hover:shadow-[10px_10px_0px_0px_rgba(255,145,77,0.25)] hover:-translate-y-1 active:scale-[0.98] active:translate-y-0 transition-all duration-300 cursor-pointer p-1.5 md:p-2 snap-center"
                                    >
                                        <div className="relative aspect-[16/10] overflow-hidden rounded-[1rem] md:rounded-[1.2rem] shrink-0">
                                            <img
                                                src={p.img || 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800'}
                                                className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-1000"
                                                alt={p.title}
                                                onError={(e: any) => {
                                                    e.target.src = 'https://images.unsplash.com/photo-1560448204-603b3fc33ddc?q=80&w=800';
                                                }}
                                            />

                                            <div className="absolute top-5 left-5">
                                                <span className="bg-black/90 backdrop-blur-md text-white text-[10px] font-black px-4 py-2 rounded-xl uppercase tracking-[0.2em] border border-white/20">
                                                    {p.type}
                                                </span>
                                            </div>

                                            <button
                                                onClick={(e) => handleToggleFavorite(e, p)}
                                                className="absolute top-5 right-5 p-2.5 bg-white/10 backdrop-blur-md rounded-xl transition-all hover:scale-110 hover:bg-white active:scale-75 group/heart"
                                            >
                                                <Heart
                                                    size={20}
                                                    className={`${isFavorite(p.id) ? 'text-red-500 fill-red-500' : 'text-white'} transition-colors group-active/heart:fill-red-400`}
                                                />
                                            </button>
                                        </div>

                                        <div className="p-4 md:p-6">
                                            <div className="flex justify-between items-start mb-4 md:mb-6">
                                                <div className="flex-1 min-w-0">
                                                    <h3 className="text-lg md:text-xl font-black text-black leading-tight mb-1 md:mb-2 group-hover:text-[#FF914D] transition-colors line-clamp-2">{p.title}</h3>
                                                    <div className="flex items-center gap-1.5 md:gap-2 text-gray-400 text-[8px] md:text-[10px] font-black uppercase tracking-widest leading-none">
                                                        <MapPin className="text-minimal-olive w-2.5 h-2.5 md:w-3 md:h-3" />
                                                        <span className="truncate">{p.location}</span>
                                                    </div>
                                                </div>
                                                <div className="flex items-center gap-1 md:gap-1.5 bg-gray-50 px-2 py-1 md:px-3 md:py-1.5 rounded-lg md:rounded-xl border border-black/5 shrink-0">
                                                    <Star className="text-minimal-olive fill-minimal-olive w-2.5 h-2.5 md:w-3.5 md:h-3.5" />
                                                    <span className="text-xs md:text-sm font-black text-black">{p.rating}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-3 gap-2 mb-4 md:mb-6">
                                                <div className="bg-gray-50/50 py-3 rounded-xl border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-1.5 group-hover:bg-[#FF914D]/5 transition-colors">
                                                    <Bed className="text-minimal-olive w-4 h-4 md:w-[18px] md:h-[18px]" />
                                                    <span className="text-[10px] md:text-xs font-black text-black">{p.beds}</span>
                                                </div>
                                                <div className="bg-gray-50/50 py-3 rounded-xl border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-1.5 group-hover:bg-minimal-olive/5 transition-colors">
                                                    <Bath className="text-minimal-olive w-4 h-4 md:w-[18px] md:h-[18px]" />
                                                    <span className="text-[10px] md:text-xs font-black text-black">{p.baths}</span>
                                                </div>
                                                <div className="bg-gray-50/50 py-3 rounded-xl border border-black/5 flex flex-col items-center justify-center gap-1 md:gap-1.5 group-hover:bg-minimal-olive/5 transition-colors">
                                                    <Square className="text-minimal-olive w-4 h-4 md:w-[18px] md:h-[18px]" />
                                                    <span className="text-[8px] md:text-[10px] font-black text-black uppercase">{p.area}</span>
                                                </div>
                                            </div>

                                            <div className="flex justify-between items-center bg-black pl-4 pr-1.5 py-2.5 md:pl-5 md:pr-2 md:py-3 rounded-xl border border-black/5 group-hover:bg-[#FF914D] active:scale-[0.97] transition-all duration-300">
                                                <div className="text-left">
                                                    <p className="text-[8px] md:text-[9px] text-white/40 font-black uppercase tracking-widest leading-none mb-0.5">Precio Total</p>
                                                    <p className="text-lg md:text-xl font-black text-white tracking-tighter leading-none">{p.price}</p>
                                                </div>
                                                <div className="w-7 h-7 md:w-8 md:h-8 bg-white rounded-lg flex items-center justify-center text-black">
                                                    <ChevronRight className="w-3.5 h-3.5 md:w-4 md:h-4" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                    </main>
                </div>
            </div>

            {selectedProperty && (
                <PropertyDetails
                    property={selectedProperty}
                    onClose={() => setSelectedProperty(null)}
                />
            )}
        </div>
    );
};

export default PropertiesPage;
