import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { ItemSizes } from '../models/ItemSizes';

@Injectable({
  providedIn: 'root',
})
export class ItemSizeService {
  baseURL = `${environment.apiURL}/itemSize`;

  constructor(private client: HttpClient) {}

  getItemSizes(itemId: number) {
    return this.client.get(`${this.baseURL}/Item/${itemId}`).pipe(take(1));
  }

  getItemSizeById(id: number) {
    return this.client.get(`${this.baseURL}/${id}`).pipe(take(1));
  }

  updateItemSize(model: ItemSizes) {
    return this.client.put(`${this.baseURL}/${model.id}`, model);
  }
}
