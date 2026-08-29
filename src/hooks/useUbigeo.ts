import { useState, useEffect } from 'react';

type UbigeoData = Record<string, Record<string, string[]>>;

export const useUbigeo = (selectedState: string, selectedMunicipality: string) => {
    const [ubigeo, setUbigeo] = useState<UbigeoData>({});
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetch(`${import.meta.env.BASE_URL}data/mexico-ubigeo.json`.replace('//', '/'))
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

    const states = Object.keys(ubigeo).sort();
    const municipalities = selectedState && ubigeo[selectedState]
        ? Object.keys(ubigeo[selectedState]).sort()
        : [];
    const cities = selectedState && selectedMunicipality && ubigeo[selectedState]?.[selectedMunicipality]
        ? [...ubigeo[selectedState][selectedMunicipality]].sort()
        : [];

    return { states, municipalities, cities, loading };
};