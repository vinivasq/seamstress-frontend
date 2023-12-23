import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Customer } from '../models/Customer';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  baseURL = `${environment.apiURL}/customer`;

  constructor(private client: HttpClient) {}

  getCustomers() {
    return this.client.get<Customer[]>(this.baseURL).pipe(take(1));
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

  public getAddress(cep: number) {
    return this.client
      .get(`https://viacep.com.br/ws/${cep}/json/`)
      .pipe(take(1));
  }
}
