export type CategoryType = 'All' | 'Buy' | 'Rent' | 'Short Stay' | 'Plots' | 'PG/Co-living';
export type PropertyStatus = 'Available' | 'Booked';

export interface Property {
  id: number;
  title: string;
  category: CategoryType;
  status: PropertyStatus;
  city: string;
  locality: string;
  bhk: string;
  area: number;
  price: number;
  deposit?: number;
  availDate?: string;
  propertyAge?: string;
  bathrooms?: string;
  balconies?: string;
  furnishing?: string;
  furnishings?: Record<string, number>;
  amenities?: string[];
  ownerId: string;
  ownerName: string;
  description: string;
  images: string[];
  propType?: string;
  subType?: string;
  createdAt?: string;
}

export interface Review {
  id?: string;
  name: string;
  comment: string;
  rating: number;
  date: string;
}

export interface Property {
  id: string;
  title: string;
  price: number | string;
  location: string;
  description: string;
  imageUrl?: string;
  reviews?: Review[]; // ప్రాపర్టీ కింద క్లైంట్స్ ఇచ్చే రివ్యూల కోసం
  [key: string]: any; // అదనపు ఫీల్డ్స్ ఏవైనా ఉంటే సపోర్ట్ చేయడానికి
}

export interface User {
  id: string;
  name: string;
  email: string;
  role: 'Verified Owner' | 'Administrator' | 'Agent' | 'Buyer';
  avatar: string;
}

export interface GoogleAccount {
  name: string;
  email: string;
  avatar: string;
}

export interface WizardData {
  title: string;
  propType: string;
  category: CategoryType;
  status: PropertyStatus;
  city: string;
  locality: string;
  subType: string;
  bhk: string;
  area: number;
  propertyAge: string;
  bathrooms: string;
  balconies: string;
  furnishing: string;
  furnishings: Record<string, number>;
  amenities: string[];
  price: number;
  deposit: number;
  availDate: string;
  images: string[];
}
