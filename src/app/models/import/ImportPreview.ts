import { ImportPreviewItem } from './ImportPreviewItem';

export interface ImportPreview {
  sessionId: string;
  toCreate: ImportPreviewItem[];
  toUpdate: ImportPreviewItem[];
  toInactivate: ImportPreviewItem[];
  failed: ImportPreviewItem[];
}
