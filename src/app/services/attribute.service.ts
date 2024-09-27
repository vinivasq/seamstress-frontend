import { HttpClient, HttpParams, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttributeService {
  _baseURL = '';

  constructor(private client: HttpClient) {}

  setAttribute(attribute: string) {
    this._baseURL = `${environment.apiURL}/${attribute}`;
  }

  getAttributes() {
    return this.client.get(this._baseURL).pipe(take(1));
  }

  getAttributeById(id: number) {
    return this.client.get(`${this._baseURL}/${id}`).pipe(take(1));
  }

  checkFK(id: number) {
    return this.client.get(`${this._baseURL}/fk/${id}`).pipe(take(1));
  }

  post(model: any) {
    return this.client.post(this._baseURL, model).pipe(take(1));
  }

  put(model: any) {
    return this.client.put(`${this._baseURL}/${model.id}`, model).pipe(take(1));
  }

  setActiveState(
    id: number,
    state: boolean
  ): Observable<any | HttpResponse<any>> {
    let params = new HttpParams();
    params = params.append('state', state);

    return this.client
      .patch(`${this._baseURL}/${id}`, {}, { observe: 'response', params })
      .pipe(take(1));
  }

  delete(id: number) {
    return this.client.delete(`${this._baseURL}/${id}`).pipe(take(1));
  }
}
