import {
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    Search,
    ChevronDown,
    Bell,
    Wallet
} from 'lucide-react';

import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import PropertyManager from './PropertyManager';
import ServiceManager from './ServiceManager';
import SettingsManager from './SettingsManager';
import MessagesManager from './MessagesManager';
import { useAuth } from '../../hooks/useAuth';
import { statsService, DashboardStats } from '../../services/crudService';
import * as XLSX from 'xlsx';



const Counter = ({ value, duration = 2000, prefix = "", suffix = "", decimals = 2 }: {
    value: number,
    duration?: number,
    prefix?: string,
    suffix?: string,
    decimals?: number
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let startTime: number | null = null;
        const startValue = 0;
        const endValue = value;

        function animate(currentTime: number) {
            if (!startTime) startTime = currentTime;
            const progress = Math.min((currentTime - startTime) / duration, 1);
            
            // Easing function: easeOutExpo
            const easeProgress = progress === 1 ? 1 : 1 - Math.pow(2, -10 * progress);
            
            setCount(startValue + (endValue - startValue) * easeProgress);

            if (progress < 1) {
                requestAnimationFrame(animate);
            } else {
                setCount(endValue);
            }
        }

        const animationFrame = requestAnimationFrame(animate);
        return () => cancelAnimationFrame(animationFrame);
    }, [value, duration]);

    return (
        <span>
            {prefix}
            {count.toLocaleString(undefined, {
                minimumFractionDigits: decimals,
                maximumFractionDigits: decimals
            })}
            {suffix}
        </span>
    );
};

const ConcentricChart = ({ stats }: { stats: DashboardStats | null }) => {
    const layers = [
        { label: `${stats?.revenue?.total || 0} Interacciones`, size: 'w-48 h-48 md:w-56 md:h-56', color: 'bg-minimal-olive/10' },
        { label: `${stats?.revenue?.expenses || 0} Visitas`, size: 'w-40 h-40 md:w-48 md:h-48', color: 'bg-minimal-olive/20' },
        { label: `${stats?.charts?.benefitsDistribution?.taxes || 0} Ocupadas`, size: 'w-32 h-32 md:w-36 md:h-36', color: 'bg-minimal-olive/30' },
        { label: `${stats?.charts?.benefitsDistribution?.costs || 0} Libres`, size: 'w-24 h-24 md:w-28 md:h-28', color: 'bg-minimal-olive' },
    ];

    return (
        <div className="flex flex-col w-full h-full">
            <div className="flex justify-between items-center mb-6">
                <h3 className="font-bold text-gray-400 text-xs">RENDIMIENTO</h3>
            </div>
            <div className="flex-1 flex items-center justify-center relative w-full h-[220px]">
                <div className="relative flex items-center justify-center w-56 h-56 sm:w-64 sm:h-64 -ml-16 sm:-ml-24">
                    {/* Circles */}
                    {layers.map((layer, i) => (
                        <div
                            key={`circle-${i}`}
                            className={`absolute rounded-full transition-all duration-700 ${layer.size} ${layer.color} ${i === 3 ? 'flex flex-col items-center justify-center text-white' : ''}`}
                            style={{ zIndex: 10 - i }}
                        >
                            {i === 3 && (
                                <>
                                    <span className="text-xl sm:text-2xl font-black leading-none">{stats?.charts?.benefitsDistribution?.costs || 0}</span>
                                    <span className="text-[9px] sm:text-[10px] font-bold tracking-widest uppercase mt-0.5 sm:mt-1">Libres</span>
                                </>
                            )}
                        </div>
                    ))}
                    
                    {/* Labels floating on the right edge */}
                    {layers.slice(0, 3).map((layer, i) => (
                        <div 
                            key={`lbl-${i}`} 
                            className="absolute right-0 translate-x-[90%] sm:translate-x-full w-max text-left"
                            style={{ top: i === 0 ? '1rem' : i === 1 ? '3.5rem' : '5.5rem', zIndex: 20 }}
                        >
                            <span className={`text-[10px] sm:text-[11px] font-black bg-white/60 px-2 py-1 rounded backdrop-blur-sm ${i === 0 ? 'text-minimal-gold/50' : i === 1 ? 'text-minimal-gold/70' : 'text-minimal-gold'}`}>
                                {layer.label}
                            </span>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

const SimpleBarChart = ({ stats }: { stats: DashboardStats | null }) => {
    const bars = stats?.charts?.monthlyRevenue || [40, 60, 45, 80, 50, 90, 70];
    const labels = (stats?.charts as any)?.monthlyLabels || ['ENE', 'FEB', 'MAR', 'ABR', 'MAY', 'JUN', 'JUL'];
    const maxVal = Math.max(...bars, 5);
    
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-50 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
                <div className="flex items-center gap-3">
                    <h3 className="font-bold text-gray-400 text-xs">Interacciones Mensuales</h3>
                    <div className="flex items-center gap-1.5 opacity-60">
                        <div className="w-2 h-2 rounded-full bg-minimal-olive"></div>
                        <span className="text-[9px] font-bold uppercase tracking-widest text-gray-400">Mensual</span>
                    </div>
                </div>
                <Search size={14} className="text-gray-300" />
            </div>
            
            <div className="flex gap-4">
                <div className="flex flex-col justify-between text-[10px] font-bold text-gray-300 h-24 py-1.5 ml-1">
                    <span>{maxVal}</span>
                    <span>{Math.round(maxVal / 2)}</span>
                    <span>0</span>
                </div>
                
                <div className="flex-1 flex flex-col overflow-hidden">
                    <div className="flex items-end justify-between h-24 gap-1.5 px-1 border-b border-gray-100 pb-1">
                        {bars.map((val: number, i: number) => (
                            <div key={i} className="w-full flex justify-center h-full items-end group">
                                <div
                                    className={`w-full max-w-[20px] rounded-t-lg transition-all duration-1000 ${i === bars.length - 1 ? 'bg-minimal-olive' : 'bg-gray-100 group-hover:bg-gray-200'}`}
                                    style={{ height: `${(val / maxVal) * 100}%` }}
                                >
                                    <div className="opacity-0 group-hover:opacity-100 absolute -mt-6 bg-black text-white text-[9px] font-bold px-1.5 py-0.5 rounded transition-opacity pointer-events-none">
                                        {val}
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="flex items-center justify-between px-1 mt-2 text-[9px] font-black text-gray-300 tracking-wider">
                        {labels.map((lbl: string, i: number) => (
                            <span key={i} className={`flex-1 text-center ${i === labels.length - 1 ? 'text-minimal-gold' : ''}`}>
                                {lbl}
                            </span>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const location = useLocation();
    const state = location.state as { activeTab?: string; selectedLeadId?: number };
    
    const [activeTab, setActiveTab] = useState<'stats' | 'properties' | 'services' | 'settings' | 'messages'>(
        (state?.activeTab as any) || 'stats'
    );
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const dashboardRef = useRef<HTMLDivElement>(null);
    const [isGeneratingReport, setIsGeneratingReport] = useState(false);

    useEffect(() => {
        if (state?.activeTab) {
            setActiveTab(state.activeTab as any);
        }
    }, [state]);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statsService.getStats();
                setStats((response.data as any) || (response as any));
            } catch (error) {
                console.error('Error fetching stats:', error);
            }
        };
        fetchStats();
    }, []);

    const handleDownloadReport = () => {
        if (!stats) return;
        
        setIsGeneratingReport(true);
        setTimeout(() => { // UI feedback delay
            try {
                // 1. Resumen General
                const wsResumen = XLSX.utils.json_to_sheet([
                    { Metrica: 'Total Propiedades', Valor: stats.charts?.benefitsDistribution?.total || 0 },
                    { Metrica: 'Propiedades Libres (Costos)', Valor: stats.charts?.benefitsDistribution?.costs || 0 },
                    { Metrica: 'Propiedades Ocupadas', Valor: stats.charts?.benefitsDistribution?.taxes || 0 },
                    { Metrica: 'Interacciones WhatsApp (Lds)', Valor: stats.revenue?.total || 0 },
                    { Metrica: 'Visitas a Propiedades', Valor: stats.revenue?.expenses || 0 }
                ]);
                
                // 2. Interacciones Mensuales (Últimos 7 meses)
                const wsMeses = XLSX.utils.json_to_sheet(
                    ((stats.charts as any).monthlyLabels || []).map((label: string, i: number) => ({
                        Mes: label,
                        Interacciones: stats.charts?.monthlyRevenue?.[i] || 0
                    }))
                );

                // 3. Actividad Reciente
                const wsActividad = XLSX.utils.json_to_sheet(
                    (stats.recentActivity || []).map((item: any) => ({
                        Actividad: item.text,
                        Tiempo: item.time
                    }))
                );

                const wb = XLSX.utils.book_new();
                XLSX.utils.book_append_sheet(wb, wsResumen, 'Resumen General');
                XLSX.utils.book_append_sheet(wb, wsMeses, 'Interacciones Mensuales');
                XLSX.utils.book_append_sheet(wb, wsActividad, 'Actividad Reciente');

                XLSX.writeFile(wb, `Reporte_Homad_Admin_${new Date().toLocaleDateString('es-ES').replace(/\//g, '-')}.xlsx`);
            } catch (error) {
                console.error('Error generating Excel', error);
            } finally {
                setIsGeneratingReport(false);
            }
        }, 300);
    };

    const statCards = [
        { 
            label: 'Interacciones WhatsApp', 
            value: stats?.revenue?.total || 0, 
            change: stats?.revenue?.change || '+0%', 
            icon: <ArrowUpRight className="text-green-500" /> 
        },
        { 
            label: 'Visitas a Propiedades', 
            value: stats?.revenue?.expenses || 0, 
            change: stats?.revenue?.expensesChange || '+0%', 
            icon: <ArrowDownRight className="text-minimal-olive" /> 
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCF0] pt-6 md:pt-12 pb-12 px-4 md:px-8 lg:px-12">
            <div ref={dashboardRef} className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">

                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight flex items-center gap-3">
                            Hola, <span className="text-minimal-gold">{user?.name.split(' ')[0] || 'Admin'}</span> 👋
                        </h1>
                        <p className="text-sm md:text-base text-gray-400 font-medium">¡Que tengas un excelente día de gestión!</p>
                    </div>

                    <div className="flex flex-wrap items-center gap-3 md:gap-4 w-full sm:w-auto">
                        <div className="relative flex-1 sm:w-48 md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
                            <input
                                type="text"
                                placeholder="Buscar..."
                                className="w-full bg-white border border-gray-100 rounded-2xl py-2.5 md:py-3 pl-10 md:pl-12 pr-4 text-xs md:text-sm font-medium focus:ring-2 focus:ring-minimal-olive/20 outline-none transition-all shadow-sm"
                            />
                        </div>
                        <div className="flex items-center gap-3">
                            <button className="p-2.5 md:p-3 bg-white border border-gray-100 rounded-2xl text-gray-500 hover:text-black transition-all shadow-sm relative">
                                <Bell size={18} />
                                <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-red-500 rounded-full border-2 border-white" />
                            </button>
                            <div className="group relative">
                                <button className="w-10 h-10 md:w-12 md:h-12 bg-black rounded-2xl flex items-center justify-center text-white font-black text-xs md:text-sm border-2 border-white shadow-xl">
                                    {user?.name.slice(0, 2).toUpperCase()}
                                </button>
                                <div className="absolute right-0 mt-2 w-48 bg-white rounded-xl shadow-xl border border-gray-100 py-2 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all z-50">
                                    <button
                                        onClick={() => logout()}
                                        className="w-full text-left px-4 py-2 text-sm font-bold text-red-500 hover:bg-red-50 transition-colors"
                                    >
                                        Cerrar Sesión
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </header>

              
                <div className="flex gap-4 border-b border-gray-100 pb-1 overflow-x-auto no-scrollbar">
                    {[
                        { id: 'stats', label: 'Estadísticas' },
                        { id: 'properties', label: 'Propiedades' },
                        { id: 'services', label: 'Servicios' },
                        { id: 'settings', label: 'Ajustes' },
                        { id: 'messages', label: 'Mensajes' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'border-minimal-gold text-black'
                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                }`}
                        >
                            {tab.label}
                        </button>
                    ))}
                </div>

                {activeTab === 'stats' ? (
                    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 md:gap-8">
                      
                        <div className="lg:col-span-8 space-y-6 md:space-y-8">
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
                                <div className="bg-black rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 text-white relative overflow-hidden group">
                                    <div className="relative z-10 space-y-6">
                                        <div className="flex justify-between items-center">
                                            <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center backdrop-blur-md">
                                                <Wallet size={24} />
                                            </div>
                                            <div className="flex -space-x-2">
                                                <div className="w-8 h-8 rounded-full border-2 border-black bg-minimal-olive" />
                                                <div className="w-8 h-8 rounded-full border-2 border-black bg-red-400" />
                                            </div>
                                        </div>
                                        <div>
                                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Interacciones</p>
                                            <p className="text-3xl font-black tracking-tighter">
                                                <Counter value={stats?.revenue?.total || 0} prefix="" decimals={0} />
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                            <div className="text-[10px] font-black tracking-widest uppercase text-white/40">ADMINISTRACIÓN UMBRAL</div>
                                            <button 
                                                onClick={handleDownloadReport}
                                                disabled={isGeneratingReport}
                                                className={`px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-minimal-olive hover:text-white transition-all ${isGeneratingReport ? 'opacity-50 cursor-not-allowed' : ''}`}
                                            >
                                                {isGeneratingReport ? 'Exportando Excel...' : 'Reporte'}
                                            </button>
                                        </div>
                                    </div>
                                    <div className="absolute top-0 right-0 w-32 h-32 bg-minimal-olive/20 rounded-full -mr-16 -mt-16 blur-3xl group-hover:bg-minimal-olive/40 transition-colors" />
                                </div>

                                {statCards.map((stat, i) => (
                                    <div key={i} className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-500 group">
                                        <div className="flex justify-between items-start mb-4 md:mb-6">
                                            <p className="text-gray-400 text-xs font-black uppercase tracking-widest">{stat.label}</p>
                                            <div className="p-2 bg-gray-50 rounded-xl group-hover:bg-minimal-olive/5 transition-colors">
                                                <MoreHorizontal size={16} className="text-gray-400" />
                                            </div>
                                        </div>
                                        <p className="text-2xl font-black text-black tracking-tighter mb-4">
                                            <Counter value={stat.value} prefix="" decimals={0} />
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-xs font-bold">
                                                {stat.icon}
                                                <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-minimal-gold'}>{stat.change}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase">vs últ. semana</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6 md:mb-10">
                                        <h3 className="font-black text-black">Ocupación (Inventario)</h3>
                                        <button className="flex items-center gap-2 text-xs font-bold text-gray-400">
                                            2025 <ChevronDown size={14} />
                                        </button>
                                    </div>
                                    <div className="flex items-center justify-center py-10">
                                        <div className="relative w-48 h-48">
                                            <div className="absolute inset-0 rounded-full border-[16px] border-gray-50" />
                                            <div className="absolute inset-0 rounded-full border-[16px] border-minimal-olive border-t-transparent border-l-transparent rotate-45" />
                                            <div className="absolute inset-0 flex flex-col items-center justify-center">
                                                <span className="text-3xl font-black text-black">
                                                    <Counter value={stats?.charts?.benefitsDistribution?.total || 0} prefix="" suffix="" decimals={0} />
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Propiedades</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-50">
                                        {[
                                            { val: stats?.charts?.benefitsDistribution?.total || 0, label: 'Total' },
                                            { val: stats?.charts?.benefitsDistribution?.costs || 0, label: 'Disponibles' },
                                            { val: stats?.charts?.benefitsDistribution?.taxes || 0, label: 'Ocupadas' }
                                        ].map((item, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-sm font-black text-black">
                                                    <Counter value={item.val} prefix="" suffix="" decimals={0} />
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-center mb-6 md:mb-8">
                                        <h3 className="font-black text-black">Actividad Reciente</h3>
                                        <span className="text-[10px] font-black text-minimal-gold uppercase tracking-widest bg-minimal-olive/10 px-3 py-1 rounded-lg">Hoy</span>
                                    </div>
                                    <div className="space-y-6 flex-1">
                                        {(stats?.recentActivity || []).map((item: any, i: number) => (
                                            <div key={i} className="flex gap-4 group cursor-pointer">
                                                <div className="w-1.5 h-1.5 rounded-full bg-minimal-olive mt-2 group-hover:scale-150 transition-all" />
                                                <div className="space-y-1">
                                                    <p className="text-sm font-bold text-black leading-tight group-hover:text-minimal-gold transition-colors">{item.text}</p>
                                                    <p className="text-[10px] text-gray-400 font-bold">{item.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {!stats?.recentActivity?.length && (
                                            <p className="text-sm text-gray-400">No hay actividad reciente.</p>
                                        )}
                                    </div>
                                </div>
                            </div>
                        </div>

                      
                        <div className="lg:col-span-4 space-y-6 md:space-y-8">
                            <div className="space-y-6 flex-1">
                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col items-stretch h-[300px] overflow-hidden">
                                    <ConcentricChart stats={stats} />
                                </div>
                                <SimpleBarChart stats={stats} />
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'properties' && <PropertyManager />}
                        {activeTab === 'services' && <ServiceManager />}
                        {activeTab === 'settings' && <SettingsManager />}
                        {activeTab === 'messages' && <MessagesManager />}
                    </div>


                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
