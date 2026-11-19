import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import brandLogo from '../assets/brand/logo-angelita-horizontal.png';
import '../styles/legal-pages.css';

type Topic = {
  title: string;
  sections: { title: string; text: string }[];
};

export const storeHelpTopics: Record<string, Topic> = {
  'cambios-y-devoluciones': {
    title: 'Cambios y devoluciones',
    sections: [
      { title: 'Solicita una revisión de tu pedido', text: 'Escríbenos con tu número de pedido, el modelo, la talla y el motivo de la solicitud. Si recibiste un artículo diferente o dañado, adjunta fotos del producto y del empaque.' },
      { title: 'Antes de enviar el producto', text: 'Conserva el comprobante y el empaque. El equipo de atención revisará tu caso y te indicará cómo proceder.' },
    ],
  },
  'como-comprar': {
    title: '¿Cómo comprar?',
    sections: [
      { title: 'Elige tu calzado', text: 'Abre el catálogo, selecciona un modelo y elige el color y la talla disponibles. Revisa el precio de la variante y agrégala al carrito.' },
      { title: 'Revisa y paga tu pedido', text: 'Confirma los artículos y cantidades, completa los datos de entrega y revisa el total. Selecciona Comprar para abrir la pasarela de pago.' },
      { title: 'Consulta la confirmación', text: 'Al finalizar, revisa el estado de tu compra y conserva el número de pedido para cualquier consulta.' },
    ],
  },
  'metodos-de-pago': {
    title: 'Métodos de pago',
    sections: [
      { title: 'Pago con tarjeta', text: 'La tienda utiliza Openpay para procesar el pago. En la pantalla de pago podrás ver las tarjetas y opciones disponibles antes de confirmar. Los precios se muestran en pesos mexicanos (MXN).' },
      { title: 'Si el pago queda pendiente', text: 'Consulta el estado del pedido antes de intentar otro pago. Si el cargo aparece en tu banco y el pedido sigue pendiente, contáctanos con tu número de pedido.' },
    ],
  },
  'guia-de-tallas': {
    title: 'Guía de tallas',
    sections: [
      { title: 'Mide ambos pies', text: 'De pie, apoya el talón contra una pared sobre una hoja. Marca la punta del dedo más largo y mide la distancia en centímetros. Repite con el otro pie y toma la medida mayor.' },
      { title: 'Confirma la talla del modelo', text: 'El ajuste puede variar por marca y modelo. Revisa las tallas disponibles en la ficha. Si estás entre dos tallas, compártenos la medida y el nombre del modelo para orientarte.' },
    ],
  },
  'preguntas-frecuentes': {
    title: 'Preguntas frecuentes',
    sections: [
      { title: '¿Necesito una cuenta para comprar?', text: 'Puedes iniciar la compra como invitado y completar tus datos durante el proceso de pago.' },
      { title: '¿Cómo sé si hay stock en mi talla?', text: 'Selecciona primero el color en la ficha del producto. Verás las tallas y existencias de esa variante.' },
      { title: '¿Dónde reviso el costo de envío?', text: 'Completa tus datos de entrega y revisa el resumen de compra antes de confirmar el pago.' },
      { title: '¿Qué hago si no encuentro mi pedido?', text: 'Si tienes una cuenta, revisa Mis compras. Si necesitas ayuda, contáctanos con el número de pedido o el correo usado al comprar.' },
    ],
  },
};

export default function StoreHelpPage({ topic }: { topic: Topic }) {
  return (
    <main className="legal-page">
      <div className="legal-page__topbar">
        <div className="legal-page__topbar-inner">Zapatería Angelita</div>
      </div>
      <div className="legal-page__brand">
        <Link to="/catalogo"><img src={brandLogo} alt="Zapatería Angelita" className="h-auto w-48" /></Link>
      </div>
      <div className="legal-page__content">
        <Link to="/catalogo" className="legal-page__back"><ArrowLeft size={18} aria-hidden="true" /> Volver al catálogo</Link>
        <article className="legal-page__panel">
          <header className="legal-page__heading"><h1 className="legal-page__title">{topic.title}</h1></header>
          <div className="legal-page__body space-y-5">
            {topic.sections.map(section => (
              <section key={section.title}>
                <h2 className="mb-1 text-base font-bold">{section.title}</h2>
                <p className="leading-relaxed text-neutral-700">{section.text}</p>
              </section>
            ))}
            <a className="inline-block break-all font-semibold text-[#b4050f] underline" href="mailto:soporte@zapateriangelita.com">
              soporte@zapateriangelita.com
            </a>
            {topic === storeHelpTopics['cambios-y-devoluciones'] && (
              <p><Link to="/terms" className="text-[#b4050f] underline">Consultar términos y condiciones</Link></p>
            )}
          </div>
        </article>
      </div>
    </main>
  );
}
