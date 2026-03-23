import { ImportColumnMapping } from './ImportColumnMapping';

export interface ImportUploadResult {
  sessionId: string;
  columns: string[];
  sampleRows: Record<string, string>[];
  savedMapping: ImportColumnMapping[] | null;
}
