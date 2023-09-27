import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class AttributeService {
  _baseURL = '';
  _atribute = '';

  constructor(private client: HttpClient) {}

  setAttribute(attribute: string) {
    this._atribute = attribute;
    this._baseURL = `${environment.apiURL}/${attribute}`;
  }

  getAttributes() {
    return this.client.get(this._baseURL).pipe(take(1));
  }

  getAttributeById(id: number) {
    return this.client.get(`${this._baseURL}/${id}`).pipe(take(1));
  }

  post(model: any) {
    return this.client.post(this._baseURL, model).pipe(take(1));
  }

  put(model: any) {
    return this.client.put(`${this._baseURL}/${model.id}`, model).pipe(take(1));
  }

  delete(id: number) {
    return this.client.delete(`${this._baseURL}/${id}`).pipe(take(1));
  }
}
