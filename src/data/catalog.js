// src/data/catalog.ts
import foto1Img from '../assets/foto1.jpg';
import foto2Img from '../assets/foto2.jpg';
import foto3Img from '../assets/foto3.jpg';
import foto4Img from '../assets/foto4.jpg';
import foto5Img from '../assets/foto5.jpg';
import foto6Img from '../assets/foto6.jpg';
import foto7Img from '../assets/foto7.jpg';
import foto8Img from '../assets/foto8.jpg';
import foto9Img from '../assets/foto9.jpg';
import foto10Img from '../assets/foto10.jpg';
import foto11Img from '../assets/foto11.jpg';
import foto12Img from '../assets/foto12.jpg';
import foto13Img from '../assets/foto13.jpg';
import comentario1Img from '../assets/comentario1.jpg';
import comentario2Img from '../assets/comentario2.jpg';
import comentario3Img from '../assets/comentario3.jpg';


export const heroSlides = [
  {
    eyebrow: "Nueva colección",
    title: "Camina con estilo y confianza",
    description: "Descubre nuestra selección de calzado para cada momento.",
    image: foto1Img,
    imagePosition: "70% center",
  },
  {
    eyebrow: "Temporada 2026",
    title: "Comodidad que acompaña tu ritmo",
    description: "Diseños ligeros, versátiles y listos para todos tus planes.",
    image: foto2Img,
    imagePosition: "72% center",
  },
];

export const finderItems = [
  {
    name: "Mujer",
    subtitle: "Elegancia para cada día",
    image: foto1Img,
  },
  {
    name: "Hombre",
    subtitle: "Clásicos que permanecen",
    image: foto3Img,
  },
  {
    name: "Niños",
    subtitle: "Pasos llenos de energía",
    image: foto7Img,
  },
];

export const categories = [
  {
    name: "Mujer",
    image: foto13Img,
    color: "#fae7e7",
  },
  {
    name: "Hombre",
    image: foto4Img,
    color: "#f5eee8",
  },
  {
    name: "Niños",
    image: foto7Img,
    color: "#fff5d9",
  },
  {
    name: "Deportivos",
    image: foto12Img,
    color: "#eaf4eb",
  },
];

export const products = [
  {
    id: 1,
    name: "Botín Mujer Catalina",
    category: "Mujer",
    price: 189.9,
    oldPrice: 229.9,
    image: foto10Img,
  },
  {
    id: 2,
    name: "Zapato Hombre Classic",
    category: "Hombre",
    price: 149.9,
    oldPrice: null,
    image: foto11Img,
    rating: 5,
  },
  {
    id: 3,
    name: "Zapatilla Urbana Rose",
    category: "Mujer",
    price: 109.9,
    oldPrice: 139.9,
    discount: "-20%",
    image: foto10Img,
    rating: 5,
  },
  {
    id: 4,
    name: "Zapatilla Deportiva Flex",
    category: "Deportivos",
    price: 139.9,
    oldPrice: null,
    image: foto2Img,
    rating: 5,
  },
  {
    id: 5,
    name: "Zapatilla Kids Casual",
    category: "Niños",
    price: 99.9,
    oldPrice: 119.9,
    discount: "-15%",
    image: foto9Img,
    rating: 5,
  },
];

export const testimonials = [
  {
    name: "María Fernanda",
    city: "Hidalgo",
    quote: "Excelente calidad y atención. Mis zapatos llegaron súper rápido y en perfecto estado.",
    avatar: comentario1Img,
  },
  {
    name: "Juan Carlos",
    city: "Los Mochis",
    quote: "Muy buena experiencia de compra. Las tallas son precisas y el pago fue sencillo.",
    avatar: comentario2Img,
  },
  {
    name: "Ana Belén",
    city: "Gualajara",
    quote: "Me encantó la variedad de modelos y los precios. Sin duda volveré a comprar.",
    avatar: comentario3Img,
  },
];

export const instagramImages = [
  foto1Img,
  foto2Img,
  foto3Img,
  foto4Img,
  foto5Img,
  foto6Img,
];