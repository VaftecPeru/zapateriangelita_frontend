import { useState } from 'react';
import { ArrowLeft, KeyRound, Loader2 } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { userService } from '../services/crudService';
import { useAuth } from '../hooks/useAuth';

const ChangeTemporaryPasswordPage = () => {
  const { user, updateUser } = useAuth();
  const navigate = useNavigate();
  const isTemporaryPassword =
    user?.must_change_password === true ||
    Number(user?.must_change_password) === 1;

  const [currentPassword, setCurrentPassword] = useState('');
  const [password, setPassword] = useState('');
  const [confirmation, setConfirmation] = useState('');
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const destination = ['admin', 'superadmin'].includes(String(user?.role || ''))
    ? '/admin/dashboard'
    : '/profile';

  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    setError('');

    if (!isTemporaryPassword && !currentPassword) {
      setError('Ingresa tu contraseña actual.');
      return;
    }

    if (password !== confirmation) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    if (
      password.length < 8 ||
      !/[A-Z]/.test(password) ||
      !/[a-z]/.test(password) ||
      !/[0-9]/.test(password)
    ) {
      setError('Usa al menos 8 caracteres e incluye mayúscula, minúscula y número.');
      return;
    }

    if (!isTemporaryPassword && password === currentPassword) {
      setError('La nueva contraseña debe ser diferente de la contraseña actual.');
      return;
    }

    setSaving(true);
    try {
      const response = isTemporaryPassword
        ? await userService.changeTemporaryPassword(password, confirmation)
        : await userService.changePassword(currentPassword, password, confirmation);

      updateUser(response.data.user || { must_change_password: false });
      navigate(destination, { replace: true });
    } catch (err: any) {
      const message =
        err?.response?.data?.errors?.current_password?.[0] ||
        err?.response?.data?.errors?.password?.[0] ||
        err?.response?.data?.message ||
        'No se pudo actualizar la contraseña.';
      setError(message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <main className="min-h-screen bg-gray-50 grid place-items-center p-4">
      <section className="w-full max-w-md rounded-[2rem] border border-gray-100 bg-white p-7 shadow-xl">
        {!isTemporaryPassword && (
          <button
            type="button"
            onClick={() => navigate(destination)}
            className="mb-4 inline-flex items-center gap-2 text-xs font-black uppercase tracking-widest text-gray-500 hover:text-black"
          >
            <ArrowLeft size={15} /> Volver
          </button>
        )}

        <div className="mx-auto mb-5 grid h-14 w-14 place-items-center rounded-2xl bg-red-50 text-store-red">
          <KeyRound size={27} />
        </div>

        <h1 className="text-center text-2xl font-black text-black">
          {isTemporaryPassword ? 'Crea tu nueva contraseña' : 'Actualizar contraseña'}
        </h1>

        <p className="mt-2 text-center text-sm text-gray-500">
          {isTemporaryPassword
            ? 'La contraseña temporal ya cumplió su función. Registra una contraseña personal para continuar.'
            : 'Por seguridad, confirma tu contraseña actual antes de establecer una nueva.'}
        </p>

        {error && (
          <div
            className="mt-5 rounded-xl border border-red-100 bg-red-50 p-3 text-sm font-bold text-red-600"
            role="alert"
          >
            {error}
          </div>
        )}

        <form onSubmit={submit} className="mt-6 space-y-4">
          {!isTemporaryPassword && (
            <label className="block text-xs font-black uppercase tracking-widest text-gray-500">
              Contraseña actual
              <input
                type="password"
                autoComplete="current-password"
                value={currentPassword}
                onChange={(event) => setCurrentPassword(event.target.value)}
                className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm normal-case tracking-normal outline-none focus:border-store-red"
                required
              />
            </label>
          )}

          <label className="block text-xs font-black uppercase tracking-widest text-gray-500">
            Nueva contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm normal-case tracking-normal outline-none focus:border-store-red"
              required
            />
          </label>

          <label className="block text-xs font-black uppercase tracking-widest text-gray-500">
            Confirmar nueva contraseña
            <input
              type="password"
              autoComplete="new-password"
              value={confirmation}
              onChange={(event) => setConfirmation(event.target.value)}
              className="mt-2 h-12 w-full rounded-xl border border-gray-200 px-4 text-sm normal-case tracking-normal outline-none focus:border-store-red"
              required
            />
          </label>

          <button
            type="submit"
            disabled={saving}
            className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-store-red text-xs font-black uppercase tracking-widest text-white disabled:opacity-50"
          >
            {saving && <Loader2 size={16} className="animate-spin" />}
            {saving ? 'Guardando...' : 'Actualizar contraseña'}
          </button>
        </form>
      </section>
    </main>
  );
};

export default ChangeTemporaryPasswordPage;
