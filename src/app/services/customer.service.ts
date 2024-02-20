import { HttpClient, HttpParams } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../models/Customer';
import { Observable, map, take } from 'rxjs';
import { environment } from 'src/environments/environment';
import { PaginatedResult } from '../models/Pagination';
import { PageParams } from '../models/PageParams';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  baseURL = `${environment.apiURL}/customer`;

  constructor(private client: HttpClient) {}

  getCustomers(
    pageParams: PageParams
  ): Observable<PaginatedResult<Customer[]>> {
    const paginatedResult = new PaginatedResult<Customer[]>();

    let params = new HttpParams();

    params = params.append('pageNumber', pageParams.page);
    params = params.append('pageSize', pageParams.itemsPerPage);

    if (pageParams.term != null && pageParams.term.length > 0)
      params = params.append('term', pageParams.term);

    return this.client
      .get<Customer[]>(this.baseURL, { observe: 'response', params })
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

  getCustomerByID(id: number) {
    return this.client.get<Customer>(`${this.baseURL}/${id}`).pipe(take(1));
  }

  deleteCustomer(id: number) {
    return this.client.delete(`${this.baseURL}/${id}`).pipe(take(1));
  }

  public post(customer: Customer) {
    return this.client.post(this.baseURL, customer).pipe(take(1));
  }

  public patch(customer: Customer) {
    return this.client
      .patch(`${this.baseURL}/${customer.id}`, customer)
      .pipe(take(1));
  }

  public getAddress(cep: string) {
    return this.client
      .get(`https://viacep.com.br/ws/${cep}/json/`)
      .pipe(take(1));
  }
}
