import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { DoughnutChart } from '../models/viewModels/charts/DoughnutChart';
import { BarLineChart } from '../models/viewModels/charts/BarLineChart';

@Injectable({
  providedIn: 'root',
})
export class ChartService {
  constructor(private client: HttpClient) {}
  baseURL = `${environment.apiURL}/chart`;

  getDoughnutChart(
    data: string,
    periodBegin: string,
    periodEnd: string
  ): Observable<DoughnutChart | HttpResponse<DoughnutChart>> {
    let params = new HttpParams();

    params = params.append('data', data);
    params = params.append('periodBegin', periodBegin);
    params = params.append('periodEnd', periodEnd);

    return this.client
      .get<DoughnutChart>(`${this.baseURL}/doughnut`, {
        observe: 'response',
        params,
      })
      .pipe(take(1));
  }

  getBarLineChart(
    data: string,
    periodBegin: string,
    periodEnd: string
  ): Observable<BarLineChart | HttpResponse<BarLineChart>> {
    let params = new HttpParams();

    params = params.append('data', data);
    params = params.append('periodBegin', periodBegin);
    params = params.append('periodEnd', periodEnd);

    return this.client
      .get<BarLineChart>(`${this.baseURL}/BarLine`, {
        observe: 'response',
        params,
      })
      .pipe(take(1));
  }
}
