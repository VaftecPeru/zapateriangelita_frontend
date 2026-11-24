export type ProductPhotoDraft = {
  source: string;
  file?: File;
};

export type ProductVariantDraft = {
  color: string;
  articleModel: string;
  priceOverride: number | null;
  skus: string[];
  sizes: string[];
  stocks: number[];
  photos: ProductPhotoDraft[];
};

export type ImportPreviewRow = {
  row: number;
  code: string;
  name: string;
  category: string;
  subcategory: string;
  brand: string;
  price: number;
  discount: number;
  stock: number;
  size: string;
  colors: string;
  material: string;
  status: 'normal' | 'oferta' | 'nuevo';
  description: string;
  valid: boolean;
  errors: string[];
};
