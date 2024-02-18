import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, map, take } from 'rxjs';
import { Order } from '../models/Order';
import { environment } from 'src/environments/environment';
import { OrderParams } from '../models/OrderParams';
import { PaginatedResult } from '../models/Pagination';

@Injectable()
export class OrderService {
  baseURL = `${environment.apiURL}/order`;

  constructor(private client: HttpClient) {}

  getOrders(orderParams: OrderParams): Observable<PaginatedResult<Order[]>> {
    const paginatedResult = new PaginatedResult<Order[]>();
    let params = new HttpParams();

    params = params.append('pageNumber', orderParams.page);
    params = params.append('pageSize', orderParams.itemsPerPage);
    params = params.append(
      'orderedAtStart',
      orderParams.orderedAtStart.toISOString()
    );
    params = params.append(
      'orderedAtEnd',
      orderParams.orderedAtEnd.toISOString()
    );

    if (orderParams.term != null && orderParams.term.length > 0)
      params = params.append('term', orderParams.term);

    if (orderParams.customerId != null && orderParams.customerId > 0)
      params = params.append('customerId', orderParams.customerId);

    if (orderParams.steps != null && orderParams.steps.length > 0)
      params = params.appendAll({ steps: orderParams.steps });

    return this.client
      .get<Order[]>(this.baseURL, { observe: 'response', params })
      .pipe(
        take(1),
        map((response) => {
          paginatedResult.result = response.body;
          if (response.headers.has('Pagination')) {
            paginatedResult.pagination = JSON.parse(
              response.headers.get('Pagination')
            );
          }

          return paginatedResult;
        })
      );
  }

  getPendingOrders() {
    return this.client.get(`${this.baseURL}/Pending`).pipe(take(1));
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
