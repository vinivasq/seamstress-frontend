import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { firstValueFrom, take } from 'rxjs';
import { Item } from '../models/Item';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemService {
  baseURL = `${environment.apiURL}/item`;

  constructor(private client: HttpClient) {}

  getItems() {
    return this.client.get(this.baseURL).pipe(take(1));
  }

  getItemById(id: number) {
    return this.client.get(`${this.baseURL}/${id}`).pipe(take(1));
  }

  async getItemAttributes(id: number) {
    return await firstValueFrom(
      this.client.get(`${this.baseURL}/${id}`).pipe(take(1))
    );
  }

  post(model: Item) {
    return this.client.post(this.baseURL, model).pipe(take(1));
  }

  put(model: Item) {
    return this.client.put(`${this.baseURL}/${model.id}`, model).pipe(take(1));
  }

  delete(id: number) {
    return this.client.delete(`${this.baseURL}/${id}`).pipe(take(1));
  }

  async updateImage(id: number, files: File[]) {
    const formData = new FormData();
    files.forEach((file) => {
      formData.append('file', file);
    });

    const response: any = await firstValueFrom(
      this.client.post(`${this.baseURL}/image/${id}`, formData).pipe(take(1))
    );

    return response.imageURL;
  }
}
