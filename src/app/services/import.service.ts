import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImportColumnMapping } from '../models/import/ImportColumnMapping';
import { ImportPreview } from '../models/import/ImportPreview';
import { ImportResult } from '../models/import/ImportResult';
import { ImportUploadResult } from '../models/import/ImportUploadResult';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  baseURL = `${environment.apiURL}/import`;

  constructor(private _client: HttpClient) {}

  public uploadCsv(file: File, salePlatformId: number): Observable<ImportUploadResult> {
    const formData = new FormData();
    formData.append('file', file, file.name);
    const params = new HttpParams().set('salePlatformId', salePlatformId.toString());
    return this._client
      .post<ImportUploadResult>(`${this.baseURL}/upload`, formData, { params })
      .pipe(take(1));
  }

  public preview(
    sessionId: string,
    mappings: ImportColumnMapping[],
    salePlatformId: number
  ): Observable<ImportPreview> {
    return this._client
      .post<ImportPreview>(`${this.baseURL}/preview`, { sessionId, mappings, salePlatformId })
      .pipe(take(1));
  }

  public executeImport(sessionId: string): Observable<ImportResult> {
    return this._client
      .post<ImportResult>(`${this.baseURL}/execute`, { sessionId })
      .pipe(take(1));
  }

  public getMapping(salePlatformId: number): Observable<ImportColumnMapping[]> {
    return this._client
      .get<ImportColumnMapping[]>(`${this.baseURL}/mapping/${salePlatformId}`)
      .pipe(take(1));
  }

  public saveMapping(
    salePlatformId: number,
    mappings: ImportColumnMapping[]
  ): Observable<any> {
    return this._client
      .put(`${this.baseURL}/mapping`, { salePlatformId, mappings })
      .pipe(take(1));
  }
}
