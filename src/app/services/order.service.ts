import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { Order } from '../models/Order';
import { environment } from 'src/environments/environment';

@Injectable()
export class OrderService {
  baseURL = `https://seamstress-backend-production.up.railway.app/api/order`;

  constructor(private client: HttpClient) {}

  getOrders() {
    return this.client.get(this.baseURL).pipe(take(1));
  }

  getOrderById(id: number) {
    return this.client.get(`${this.baseURL}/${id}`).pipe(take(1));
  }

  deleteOrder(id: number) {
    return this.client.delete(`${this.baseURL}/${id}`).pipe(take(1));
  }

  post(model: Order) {
    return this.client.post(this.baseURL, model).pipe(take(1));
  }

  put(model: Order) {
    return this.client.put(`${this.baseURL}/${model.id}`, model).pipe(take(1));
  }

  updateOrder(orderId: number, step: number) {
    return this.client
      .patch(`${this.baseURL}/${orderId}/${step}`, {})
      .pipe(take(1));
  }
}
