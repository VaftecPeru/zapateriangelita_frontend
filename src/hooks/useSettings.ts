import { useState, useEffect } from 'react';
import { settingsService } from '../services/crudService';

export const useSettings = () => {
    const [settings, setSettings] = useState<{ [key: string]: string }>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const response = await settingsService.getAll();
                setSettings(response.data.data || {});
            } catch (err) {
                console.error("Error fetching settings hook:", err);
            } finally {
                setLoading(false);
            }
        };
        fetchSettings();
    }, []);

    return { settings, loading };
};
