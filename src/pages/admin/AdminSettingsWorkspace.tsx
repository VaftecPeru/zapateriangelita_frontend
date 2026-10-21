import { useState } from 'react';
import { Settings2, Truck, UsersRound } from 'lucide-react';
import type { User } from '../../services/crudService';
import SettingsManager from './SettingsManager';
import ServiceManager from './ServiceManager';
import UsersManager from './UsersManager';

type Section = 'general' | 'delivery' | 'users';

/**
 * Ajustes agrupa configuración del sitio, costo delivery y gestión de usuarios.
 * El CRUD existente de delivery se reutiliza sin exponer Servicios como pestaña principal.
 */
const AdminSettingsWorkspace = ({
    initialSection = 'general',
    initialUsers,
}: {
    initialSection?: Section;
    initialUsers?: User[];
}) => {
    const [section, setSection] = useState<Section>(initialSection);

    return (
        <div className="space-y-5" data-testid="admin-settings-workspace">
            <div className="rounded-2xl border border-gray-200/80 bg-white p-2 shadow-sm">
                <div role="tablist" aria-label="Secciones de Ajustes" className="flex flex-wrap gap-2">
                    {([
                        { id: 'general', label: 'General', icon: Settings2 },
                        { id: 'delivery', label: 'Costo delivery', icon: Truck },
                        { id: 'users', label: 'Usuarios', icon: UsersRound },
                    ] as const).map(({ id, label, icon: Icon }) => (
                        <button
                            type="button"
                            role="tab"
                            id={`settings-tab-${id}`}
                            aria-selected={section === id}
                            aria-controls="settings-panel"
                            key={id}
                            onClick={() => setSection(id)}
                            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-4 py-2.5 text-[13px] font-semibold transition-all duration-200 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-store-red ${
                                section === id
                                    ? 'bg-red-50 text-store-red ring-1 ring-red-100'
                                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900'
                            }`}
                        >
                            <Icon size={15} aria-hidden="true" />
                            {label}
                        </button>
                    ))}
                </div>
            </div>
            <div role="tabpanel" id="settings-panel" aria-labelledby={`settings-tab-${section}`}>
                {section === 'delivery' ? (
                    <ServiceManager deliveryOnly />
                ) : section === 'users' ? (
                    <UsersManager initialData={initialUsers} />
                ) : (
                    <SettingsManager />
                )}
            </div>
        </div>
    );
};

export default AdminSettingsWorkspace;
