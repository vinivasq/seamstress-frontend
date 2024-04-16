import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemOrderInputDto } from '../dtos/ItemOrderInputDto';

@Injectable({
  providedIn: 'root',
})
export class ItemOrderService {
  private _baseURL = `${environment.apiURL}/ItemOrder`;

  constructor(private client: HttpClient) {}

  getItemOrder(id: number) {
    return this.client.get(`${this._baseURL}/${id}`).pipe(take(1));
  }

  update(id: number, itemOrder: ItemOrderInputDto) {
    return this.client.put(`${this._baseURL}/${id}`, itemOrder).pipe(take(1));
  }
  delete(id: number) {
    return this.client.delete(`${this._baseURL}/${id}`).pipe(take(1));
  }
}
