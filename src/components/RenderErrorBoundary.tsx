import { Component, type ErrorInfo, type ReactNode } from 'react';

export default class RenderErrorBoundary extends Component<{ children: ReactNode }, { failed: boolean }> {
  state = { failed: false };

  static getDerivedStateFromError() {
    return { failed: true };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('Error al mostrar la aplicación', error, info.componentStack);
  }

  render() {
    if (this.state.failed) {
      return <main className="flex min-h-screen flex-col items-center justify-center gap-4 bg-white p-6 text-center">
        <h1 className="text-xl font-bold">No pudimos mostrar esta vista</h1>
        <p role="alert">Recarga la página para volver a intentarlo o regresa al inicio.</p>
        <button type="button" onClick={() => window.location.reload()} className="rounded-xl bg-store-red px-6 py-3 font-bold text-white">Recargar página</button>
        <a href="/" className="text-sm underline">Volver al inicio</a>
      </main>;
    }
    return this.props.children;
  }
}
