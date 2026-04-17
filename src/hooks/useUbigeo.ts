import { useState, useEffect } from 'react';

type UbigeoData = Record<string, Record<string, string[]>>;

export const useUbigeo = (selectedDepartment: string, selectedProvince: string) => {
    const [ubigeo, setUbigeo] = useState<UbigeoData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/peru-ubigeo.json`.replace('//', '/'))
            .then(res => {
                if (!res.ok) throw new Error('Failed to fetch data');
                return res.json();
            })
            .then((data: UbigeoData) => {
                setUbigeo(data);
                setLoading(false);
            })
            .catch(() => {
                setLoading(false);
            });
    }, []);

    const departments = Object.keys(ubigeo).sort();
    const provinces = selectedDepartment && ubigeo[selectedDepartment]
        ? Object.keys(ubigeo[selectedDepartment]).sort()
        : [];
    const districts = selectedDepartment && selectedProvince && ubigeo[selectedDepartment]?.[selectedProvince]
        ? [...ubigeo[selectedDepartment][selectedProvince]].sort()
        : [];

    return { departments, provinces, districts, loading };
};
