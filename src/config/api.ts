
//  LOCAL 
//export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

//  PRODUCCIÓN - Descomentar para producción
export const API_URL = import.meta.env.VITE_API_URL || 'https://api.zapateriangelita.com/api';

export const getImageUrl = (path?: string | null): string => {
    if (!path) return '';

    const apiUrl = API_URL.replace(/\/$/, '');
    const baseUrl = apiUrl.replace(/\/api\/?$/, '');

    const buildMediaUrl = (pathname: string, search = '') => {
        const cleanPath = pathname.startsWith('/') ? pathname : `/${pathname}`;

        if (cleanPath.startsWith('/api/media/')) {
            return `${baseUrl}${cleanPath}${search}`;
        }
        if (cleanPath.startsWith('/uploads/')) {
            return `${apiUrl}/media${cleanPath}${search}`;
        }
        if (cleanPath.startsWith('/storage/')) {
            return `${apiUrl}/media/${cleanPath.replace(/^\/storage\//, '')}${search}`;
        }
        return `${baseUrl}${cleanPath}${search}`;
    };

    if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
            const url = new URL(path);
            if (/^\/(uploads|storage)\//.test(url.pathname) || url.pathname.startsWith('/api/media/')) {
                return buildMediaUrl(url.pathname, url.search);
            }
            if (url.hostname === 'localhost' || url.hostname === '127.0.0.1') {
                return buildMediaUrl(url.pathname, url.search);
            }
            return path;
        } catch {
            return path;
        }
    }

    return buildMediaUrl(path);
};
