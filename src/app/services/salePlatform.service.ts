import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { SalePlatform } from '../models/SalePlatform';

@Injectable({
  providedIn: 'root',
})
export class SalePlatformService {
  baseURL = `${environment.apiURL}/SalePlatform`;

  constructor(private _client: HttpClient) {}

  getSalePlatforms(): Observable<SalePlatform[]> {
    return this._client.get<SalePlatform[]>(this.baseURL).pipe(take(1));
  }
}
