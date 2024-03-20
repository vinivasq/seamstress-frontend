import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class StatisticsService {
  baseURL = `${environment.apiURL}/Statistics`;

  constructor(private _client: HttpClient) {}

  getStatistics() {
    return this._client.get(this.baseURL).pipe(take(1));
  }
}
