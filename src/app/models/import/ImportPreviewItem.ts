export interface ImportPreviewItem {
  externalId: string;
  name: string;
  price: number;
  colors: string[];
  fabric: string;
  sizes: string[];
  action: string;
  changes: string[];
  failReason: string | null;
}
