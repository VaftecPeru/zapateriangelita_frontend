export const ADMIN_MODULE_TABS = [
    { id: 'stats', label: 'Estadísticas' },
    { id: 'messages', label: 'Pedido' },
    { id: 'products', label: 'Productos' },
    { id: 'inventory', label: 'Inventario' },
    { id: 'customers', label: 'Clientes' },
    { id: 'sales', label: 'Ventas' },
    { id: 'reports', label: 'Reportes' },
    { id: 'users', label: 'Usuarios' },
    { id: 'funnelLeads', label: 'Interesados' },
    { id: 'settings', label: 'Ajustes' },
] as const;

export type AdminModuleId = (typeof ADMIN_MODULE_TABS)[number]['id'];

const AdminModuleTabs = ({
    activeTab,
    onSelect,
}: {
    activeTab: string;
    onSelect: (tab: AdminModuleId) => void;
}) => (
    <nav aria-label="Módulos administrativos" className="overflow-x-auto rounded-2xl border border-gray-200/80 bg-white p-1.5 shadow-sm no-scrollbar">
        <div role="tablist" aria-label="Secciones del intranet" className="flex min-w-max items-center gap-1">
            {ADMIN_MODULE_TABS.map((tab) => (
                <button
                    key={tab.id}
                    type="button"
                    role="tab"
                    aria-selected={activeTab === tab.id}
                    onClick={() => onSelect(tab.id)}
                    className={`min-h-[40px] whitespace-nowrap rounded-xl px-3 py-2.5 text-[13px] font-semibold uppercase tracking-[0.035em] transition-colors duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-red ${
                        activeTab === tab.id
                            ? 'bg-red-50 text-store-red ring-1 ring-red-100'
                            : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                    }`}
                >
                    {tab.label}
                </button>
            ))}
        </div>
    </nav>
);

export default AdminModuleTabs;
