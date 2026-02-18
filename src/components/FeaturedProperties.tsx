import { Star, MapPin, Bed, Bath, Square, Heart } from 'lucide-react';

const properties = [
  {
    id: 1,
    type: "Apartamento",
    status: "Disponible",
    title: "Apartamento Moderno en el Centro",
    location: "Centro, Ciudad Principal",
    beds: 2,
    baths: 2,
    area: "85m²",
    price: "$1,200",
    rating: 4.8,
    reviews: 124,
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 2,
    type: "Habitación",
    status: "Disponible",
    title: "Habitación Premium con Baño Privado",
    location: "Zona Universitaria",
    beds: 1,
    baths: 1,
    area: "25m²",
    price: "$450",
    rating: 4.6,
    reviews: 89,
    img: "https://images.unsplash.com/photo-1502672260266-1c1ef2d93688?auto=format&fit=crop&q=80&w=600"
  },
  {
    id: 3,
    type: "Apartamento",
    status: "Disponible",
    title: "Estudio Ejecutivo Vista al Mar",
    location: "Zona Costera",
    beds: 1,
    baths: 1,
    area: "45m²",
    price: "$1,800",
    rating: 4.9,
    reviews: 156,
    img: "https://images.unsplash.com/photo-1522708323590-d24dbb6b0267?auto=format&fit=crop&q=80&w=600"
  },
];

const FeaturedProperties = ({ onOpenDetails }: any) => (
  <section className="py-24 px-6 bg-white outline-none">
    <div className="max-w-7xl mx-auto">
      <div className="mb-12">
        <h2 className="homad-h2">Propiedades Destacadas</h2>
        <p className="homad-p-muted mt-2 font-medium">6 propiedades disponibles</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {properties.map((p) => (
          <div
            key={p.id}
            onClick={() => onOpenDetails(p)}
            className="homad-card"
          >

            <div className="relative aspect-[4/3] overflow-hidden rounded-3xl">
              <img
                src={p.img}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                alt={p.title}
              />


              <div className="absolute top-4 left-4 flex flex-col gap-2">
                <span className="homad-badge-black">
                  {p.type}
                </span>
                <span className="homad-badge-green">
                  {p.status}
                </span>
              </div>


              <button className="absolute top-4 right-4 p-2.5 bg-white rounded-full shadow-sm hover:scale-110 transition-transform">
                <Heart size={18} className="text-gray-400" />
              </button>
            </div>

            <div className="py-6">
              <h3 className="text-lg font-bold text-gray-900 mb-1 leading-tight group-hover:text-black transition-colors">
                {p.title}
              </h3>

              <div className="flex items-center gap-1.5 text-gray-400 text-sm mb-4">
                <MapPin size={14} />
                <span>{p.location}</span>
              </div>

              <div className="flex items-center gap-4 mb-6 text-gray-400">
                <div className="flex items-center gap-1.5">
                  <Bed size={16} />
                  <span className="text-xs font-medium">{p.beds}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Bath size={16} />
                  <span className="text-xs font-medium">{p.baths}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Square size={16} />
                  <span className="text-xs font-medium">{p.area}</span>
                </div>
              </div>

              <div className="flex justify-between items-center border-t border-gray-50 pt-5">
                <div className="flex items-center gap-1.5">
                  <Star size={16} className="text-yellow-400 fill-yellow-400" />
                  <span className="text-sm font-bold text-gray-900">{p.rating}</span>
                  <span className="text-xs text-gray-400">({p.reviews})</span>
                </div>
                <div className="text-right">
                  <p className="text-xl font-bold text-gray-900">{p.price}</p>
                  <p className="text-[10px] text-gray-400 font-medium">por mes</p>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  </section>
);

export default FeaturedProperties;