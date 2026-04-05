import { ImportPreviewItem } from './ImportPreviewItem';

export interface ImportResult {
  created: number;
  updated: number;
  inactivated: number;
  failed: ImportPreviewItem[];
  errors: string[];
}
