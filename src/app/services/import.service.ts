import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ImportPreview } from '../models/import/ImportPreview';
import { ImportResult } from '../models/import/ImportResult';

@Injectable({
  providedIn: 'root',
})
export class ImportService {
  baseURL = `${environment.apiURL}/import`;

  constructor(private _client: HttpClient) {}

  public preview(products: any[], salePlatformId: number): Observable<ImportPreview> {
    return this._client
      .post<ImportPreview>(`${this.baseURL}/preview`, { products, salePlatformId })
      .pipe(take(1));
  }

  public executeImport(sessionId: string): Observable<ImportResult> {
    return this._client
      .post<ImportResult>(`${this.baseURL}/execute`, { sessionId })
      .pipe(take(1));
  }

  public fetchNuvemShopPreview(): Observable<ImportPreview> {
    return this._client
      .get<ImportPreview>(`${environment.apiURL}/nuvemshop/import-preview`)
      .pipe(take(1));
  }
}
