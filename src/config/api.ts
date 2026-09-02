

//  LOCAL 
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api';

//  PRODUCCIÓN - Descomentar para producción
// export const API_URL = import.meta.env.VITE_API_URL || 'https://api.zapateriangelita.com/api';

export const getImageUrl = (path?: string | null): string => {
    if (!path) return '';

    const baseUrl = API_URL.replace(/\/api\/?$/, '');
    
    if (path.startsWith('http://') || path.startsWith('https://')) {
        try {
            const url = new URL(path);
            if (
                url.hostname === 'localhost' ||
                url.hostname === '127.0.0.1' ||
                (/\/(uploads|storage)\//.test(url.pathname) && url.origin !== baseUrl)
            ) {
                return `${baseUrl}${url.pathname}${url.search}`;
            }
        } catch {
            return path;
        }
        return path;
    }

    const cleanPath = path.startsWith('/') ? path : '/' + path;
    return `${baseUrl}${cleanPath}`;
};