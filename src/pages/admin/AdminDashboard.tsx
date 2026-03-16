import {
    Wallet,
    Bell,
    Search,
    MoreHorizontal,
    ArrowUpRight,
    ArrowDownRight,
    ChevronDown
} from 'lucide-react';

import { useAuth } from '../../hooks/useAuth';
import { useState, useEffect } from 'react';
import PropertyManager from './PropertyManager';
import ServiceManager from './ServiceManager';
import { statsService, DashboardStats } from '../../services/crudService';



const Counter = ({ value, duration = 2000, prefix = "", suffix = "", decimals = 2 }: {
    value: number,
    duration?: number,
    prefix?: string,
    suffix?: string,
    decimals?: number
}) => {
    const [count, setCount] = useState(0);

    useEffect(() => {
        let start = 0;
        const end = value;
        if (start === end) return;

        let totalMiliseconds = duration;
        let incrementTime = (totalMiliseconds / end) * 5;
        if (incrementTime < 10) incrementTime = 10;

        let timer = setInterval(() => {
            start += (end - start) / 10;
            if (Math.abs(end - start) < 0.1) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(start);
            }
        }, 30);

        return () => clearInterval(timer);
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
        { label: `$ ${stats?.revenue.total ? Math.round(stats.revenue.total / 1000) : 29}k`, size: 'w-48 h-48 md:w-56 md:h-56', color: 'bg-minimal-olive/10' },
        { label: `$ ${stats?.revenue.expenses ? Math.round(stats.revenue.expenses / 1000) : 21}k`, size: 'w-40 h-40 md:w-48 md:h-48', color: 'bg-minimal-olive/20' },
        { label: `$ ${stats?.charts.benefitsDistribution.taxes ? Math.round(stats.charts.benefitsDistribution.taxes / 1000) : 17}k`, size: 'w-32 h-32 md:w-36 md:h-36', color: 'bg-minimal-olive/30' },
        { label: `$ ${stats?.charts.benefitsDistribution.costs ? Math.round(stats.charts.benefitsDistribution.costs / 1000) : 14}k`, size: 'w-24 h-24 md:w-28 md:h-28', color: 'bg-minimal-olive' },
    ];

    return (
        <div className="relative flex flex-col items-center justify-center p-4">
            <h3 className="absolute top-0 left-0 font-bold text-gray-500 text-sm">Beneficios anuales</h3>
            <div className="relative flex items-center justify-center mt-8">
                {layers.map((layer, i) => (
                    <div
                        key={i}
                        className={`absolute rounded-full flex flex-col items-center justify-start pt-2 transition-all duration-700 ${layer.size} ${layer.color} ${i === 3 ? 'justify-center pt-0' : ''}`}
                        style={{ zIndex: 10 - i }}
                    >
                        <span className={`text-[10px] sm:text-xs font-black ${i === 3 ? 'text-white text-lg' : 'text-red-900/40'}`}>
                            {layer.label}
                        </span>
                    </div>
                ))}
            </div>
        </div>
    );
};

const SimpleBarChart = ({ stats }: { stats: DashboardStats | null }) => {
    const bars = stats?.charts.monthlyRevenue || [40, 60, 45, 80, 50, 90, 70];
    const maxVal = Math.max(...bars);
    
    return (
        <div className="bg-white rounded-3xl p-6 border border-gray-50 shadow-sm space-y-4">
            <div className="flex justify-between items-center mb-2">
                <h3 className="font-bold text-gray-400 text-xs">Beneficios anuales</h3>
                <Search size={14} className="text-gray-300" />
            </div>
            <div className="space-y-1">
                <p className="text-xl font-black text-black tracking-tight">
                    <Counter value={stats?.revenue.total || 0} prefix="$ " suffix="" />
                </p>
                <p className="text-[10px] font-bold text-gray-300 uppercase letter tracking-widest">USD</p>
            </div>
            <div className="flex items-end justify-between h-24 gap-1.5 px-1">
                {bars.map((val, i) => (
                    <div
                        key={i}
                        className={`w-full rounded-full transition-all duration-1000 ${i === bars.length - 1 ? 'bg-minimal-olive' : 'bg-gray-100'}`}
                        style={{ height: `${(val / maxVal) * 100}%` }}
                    />
                ))}
            </div>
        </div>
    );
};

const AdminDashboard = () => {
    const { user, logout } = useAuth();
    const [activeTab, setActiveTab] = useState<'stats' | 'properties' | 'services'>('stats');
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchStats = async () => {
            try {
                const response = await statsService.getStats();
                setStats(response.data);
            } catch (err) {
                console.error("Error fetching stats:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchStats();
    }, []);

    const statCards = [
        { 
            label: 'Ingresos por Rentas', 
            value: stats?.revenue.total || 0, 
            change: stats?.revenue.change || '+0%', 
            icon: <ArrowUpRight className="text-green-500" /> 
        },
        { 
            label: 'Gastos Operativos', 
            value: stats?.revenue.expenses || 0, 
            change: stats?.revenue.expensesChange || '-0%', 
            icon: <ArrowDownRight className="text-minimal-olive" /> 
        },
    ];

    return (
        <div className="min-h-screen bg-[#FDFCF0] pt-6 md:pt-12 pb-12 px-4 md:px-8 lg:px-12">
            <div className="max-w-[1600px] mx-auto space-y-6 md:space-y-8">

                <header className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-6">
                    <div className="space-y-1">
                        <h1 className="text-2xl md:text-3xl font-black text-black tracking-tight flex items-center gap-3">
                            Hola, <span className="text-minimal-olive">{user?.name.split(' ')[0] || 'Admin'}</span> 👋
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
                        { id: 'services', label: 'Servicios' }
                    ].map((tab) => (
                        <button
                            key={tab.id}
                            onClick={() => setActiveTab(tab.id as any)}
                            className={`px-6 py-3 text-sm font-black uppercase tracking-widest transition-all border-b-2 whitespace-nowrap ${activeTab === tab.id
                                ? 'border-minimal-olive text-black'
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
                                            <p className="text-white/50 text-xs font-bold uppercase tracking-widest mb-1">Recaudación Mensual</p>
                                            <p className="text-3xl font-black tracking-tighter">
                                                <Counter value={12450.00} prefix="$ " />
                                            </p>
                                        </div>
                                        <div className="flex justify-between items-end pt-4 border-t border-white/10">
                                            <div className="text-[10px] font-black tracking-widest uppercase text-white/40">ADMINISTRACIÓN UMBRAL</div>
                                            <button className="px-4 py-2 bg-white text-black rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-minimal-olive hover:text-white transition-all">Reporte</button>
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
                                            <Counter value={stat.value} prefix="$ " />
                                        </p>
                                        <div className="flex items-center gap-2">
                                            <div className="flex items-center gap-1 text-xs font-bold">
                                                {stat.icon}
                                                <span className={stat.change.startsWith('+') ? 'text-green-500' : 'text-minimal-olive'}>{stat.change}</span>
                                            </div>
                                            <span className="text-[10px] text-gray-300 font-bold uppercase">vs últ. semana</span>
                                        </div>
                                    </div>
                                ))}
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 md:gap-8">
                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
                                    <div className="flex justify-between items-center mb-6 md:mb-10">
                                        <h3 className="font-black text-black">Beneficios Anuales</h3>
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
                                                    <Counter value={stats?.charts.benefitsDistribution.total || 0} prefix="$ " suffix="" decimals={0} />
                                                </span>
                                                <span className="text-[10px] text-gray-400 font-black uppercase tracking-widest">Utilidad</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="grid grid-cols-3 gap-4 pt-10 border-t border-gray-50">
                                        {[
                                            { val: stats?.charts.benefitsDistribution.total || 0, label: 'Total' },
                                            { val: stats?.charts.benefitsDistribution.costs || 0, label: 'Costos' },
                                            { val: stats?.charts.benefitsDistribution.taxes || 0, label: 'Impuestos' }
                                        ].map((item, i) => (
                                            <div key={i} className="text-center">
                                                <p className="text-sm font-black text-black">
                                                    <Counter value={item.val} prefix="$ " suffix="" decimals={0} />
                                                </p>
                                                <p className="text-[10px] text-gray-400 font-bold uppercase tracking-widest">{item.label}</p>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm flex flex-col">
                                    <div className="flex justify-between items-center mb-6 md:mb-10">
                                        <h3 className="font-black text-black">Gestión Operativa</h3>
                                        <Search size={16} className="text-gray-400" />
                                    </div>
                                    <div className="space-y-6 flex-1">
                                        {[
                                            { label: 'Limpieza de Unidades', status: 'Activo', color: 'bg-minimal-olive' },
                                            { label: 'Mantenimiento Preventivo', status: 'Pendiente', color: 'bg-yellow-400' },
                                            { label: 'Gestión de Reservas', status: 'Pagado', color: 'bg-minimal-olive' }
                                        ].map((plan, i) => (
                                            <div key={i} className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl hover:bg-gray-100 transition-all cursor-pointer group">
                                                <div className="flex items-center gap-4">
                                                    <div className={`w-3 h-3 rounded-full ${plan.color}`} />
                                                    <span className="font-bold text-sm text-black">{plan.label}</span>
                                                </div>
                                                <MoreHorizontal size={14} className="text-gray-300 group-hover:text-black transition-all" />
                                            </div>
                                        ))}
                                    </div>
                                    <button className="w-full mt-6 py-4 bg-black text-white rounded-2xl font-black text-xs uppercase tracking-[0.2em] hover:bg-minimal-olive transition-all">
                                        Ver todas las tareas
                                    </button>
                                </div>
                            </div>
                        </div>

                      
                        <div className="lg:col-span-4 space-y-6 md:space-y-8">
                            <div className="space-y-6">
                                <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm relative h-[300px] flex items-center justify-center overflow-hidden">
                                    <ConcentricChart stats={stats} />
                                </div>
                                <SimpleBarChart stats={stats} />
                            </div>

                            <div className="bg-white rounded-[2rem] md:rounded-[2.5rem] p-6 md:p-8 border border-gray-100 shadow-sm">
                                <div className="flex justify-between items-center mb-6 md:mb-8">
                                    <h3 className="font-black text-black">Actividad Reciente</h3>
                                    <span className="text-[10px] font-black text-minimal-olive uppercase tracking-widest bg-minimal-olive/10 px-3 py-1 rounded-lg">Hoy</span>
                                </div>
                                <div className="space-y-6">
                                    {(stats?.recentActivity || [
                                        { text: "Reserva confirmada: Habitación Premium", time: "10:24 AM" },
                                        { text: "Check-in completado: Suite Familiar", time: "09:12 AM" },
                                        { text: "Servicio de limpieza solicitado", time: "08:45 AM" },
                                        { text: "Nueva consulta vía WhatsApp", time: "Ayer" }
                                    ]).map((item, i) => (
                                        <div key={i} className="flex gap-4 group cursor-pointer">
                                            <div className="w-1.5 h-1.5 rounded-full bg-minimal-olive mt-2 group-hover:scale-150 transition-all" />
                                            <div className="space-y-1">
                                                <p className="text-sm font-bold text-black leading-tight group-hover:text-minimal-olive transition-colors">{item.text}</p>
                                                <p className="text-[10px] text-gray-400 font-bold">{item.time}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {activeTab === 'properties' && <PropertyManager />}
                        {activeTab === 'services' && <ServiceManager />}
                    </div>


                )}
            </div>
        </div>
    );
};

export default AdminDashboard;
