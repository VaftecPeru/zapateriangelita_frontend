export type ProductVariantDraft = {
  color: string;
  sizes: string[];
  stocks: number[];
  files: File[];
  previews: string[];
  existingImages: string[];
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
