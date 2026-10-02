import { useEffect, useMemo, useState } from 'react';

type MunicipalityEntry = {
    code: string;
    name: string;
    head: string;
};

type UbigeoData = Record<string, MunicipalityEntry[]>;

const sortEsMx = (values: string[]) =>
    [...values].sort((a, b) => a.localeCompare(b, 'es-MX'));

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

    const states = useMemo(
        () => sortEsMx(Object.keys(ubigeo)),
        [ubigeo],
    );

    const stateEntries = selectedState ? ubigeo[selectedState] || [] : [];

    // Algunos municipios de Oaxaca comparten exactamente el mismo nombre.
    // El selector muestra el nombre una sola vez y las cabeceras permiten
    // distinguir la ciudad/localidad correspondiente sin perder registros.
    const municipalities = useMemo(
        () => sortEsMx([...new Set(stateEntries.map(entry => entry.name))]),
        [stateEntries],
    );

    const cities = useMemo(
        () => selectedMunicipality
            ? sortEsMx([
                ...new Set(
                    stateEntries
                        .filter(entry => entry.name === selectedMunicipality)
                        .map(entry => entry.head)
                        .filter(Boolean),
                ),
            ])
            : [],
        [stateEntries, selectedMunicipality],
    );

    return { states, municipalities, cities, loading };
};
