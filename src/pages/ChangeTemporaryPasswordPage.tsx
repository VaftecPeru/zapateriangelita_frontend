import { useState } from 'react';
import { KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/crudService';
import { useAuth } from '../hooks/useAuth';

const ChangeTemporaryPasswordPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }
    if (password.length < 8 || !/[A-Z]/.test(password) || !/[a-z]/.test(password) || !/[0-9]/.test(password)) {
      setError('Usa al menos 8 caracteres e incluye mayúscula, minúscula y número.');
      return;
    }

    setSaving(true);
    try {
      const response = await userService.changeTemporaryPassword(password, confirmation);
      updateUser(response.data.user || { must_change_password: false });
      navigate(['admin', 'superadmin'].includes(String(user?.role || '')) ? '/admin/dashboard' : '/home', { replace: true });
    } catch (err: any) {
      setError(err?.response?.data?.errors?.password?.[0] || err?.response?.data?.message || 'No se pudo actualizar la contraseña.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 grid place-items-center p-4">
      <section className="w-full max-w-md rounded-[2rem] border border-gray-100 bg-white p-7 shadow-xl">
        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-store-red">
          <KeyRound size={27} />
        </div>
        <h1 className="text-center text-2xl font-black text-black">Crea tu nueva contraseña</h1>
        <p className="mt-2 text-center text-sm text-gray-500">La contraseña temporal ya cumplió su función. Registra una contraseña personal para continuar.</p>

        {error && <div className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600" role="alert">{error}</div>}

        <form onSubmit={submit} className="mt-6 space-y-4">
          <label className="block text-xs font-black uppercase tracking-widest text-gray-500">
            Nueva contraseña
            <input type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm normal-case tracking-normal outline-none focus:border-store-red" required />
          </label>
          <label className="block text-xs font-black uppercase tracking-widest text-gray-500">
            Confirmar nueva contraseña
            <input type="password" autoComplete="new-password" value={confirmation} onChange={(event) => setConfirmation(event.target.value)} className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm normal-case tracking-normal outline-none focus:border-store-red" required />
          </label>
          <button type="submit" disabled={saving} className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-store-red text-xs font-black uppercase tracking-widest text-white disabled:opacity-50">
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ChangeTemporaryPasswordPage;
