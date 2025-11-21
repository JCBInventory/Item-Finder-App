export interface InventoryItem {
  itemNo: string;
  description: string;
  group: string;
  model: string;
  bhlHlnFlag: string;
  hsnTax: number;
  saleRate: number;
  mrp: number;
  [key: string]: string | number; // Allow loose indexing for parsing
}

export interface CartItem extends InventoryItem {
  qty: number;
  total: number;
}

export interface Quotation {
  items: CartItem[];
  subtotal: number;
  discount: number;
  finalTotal: number;
  timestamp: number;
}

export interface AppConfig {
  sheetUrl: string | null;
  lastUpdated: number;
}

export enum UserRole {
  PARENT = 'PARENT',
  CHILD = 'CHILD'
}

export enum ViewState {
  INVENTORY = 'INVENTORY',
  QUOTATION = 'QUOTATION'
}