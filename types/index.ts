export interface ProductOwner {
  owner_id: string;
  owner_name: string;
  owner_email: string;
  owner_img?: string;
}

export interface ProductDimensions {
  length?: number;
  width?: number;
  height?: number;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  price: number;
  stock: number;
  image?: string;
  images?: string[];
  video_url?: string;
  category: string;
  brand?: string;
  sku?: string;
  status?: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags?: string[];
  create_date?: string;
  update_date?: string;
  owner?: ProductOwner;
}

export interface ProductFormData {
  name: string;
  description: string;
  price: number;
  stock: number;
  image: string;
  images: string[];
  video_url?: string;
  category: string;
  brand: string;
  sku: string;
  status: string;
  weight?: number;
  dimensions?: ProductDimensions;
  tags: string[];
  owner?: ProductOwner;
}
