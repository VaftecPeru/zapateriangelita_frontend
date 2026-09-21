// Solo destinos internos conocidos: conservar el checkout o la compra confirmada.
export function authDestination(role?: string, from?: string, mustChangePassword = false): string {
    if (mustChangePassword) return '/change-temporary-password';
    if (['admin', 'superadmin'].includes(String(role || ''))) return '/admin/dashboard';
    const allowed = ['/checkout', '/profile/purchases', '/profile', '/welcome', '/home'];
    return from && allowed.includes(from) ? from : '/welcome';
}
