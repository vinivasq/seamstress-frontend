import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class IBGEService {
  baseURL = 'https://servicodados.ibge.gov.br/api/v1/';

  constructor(private client: HttpClient) {}

  getUFs() {
    return this.client.get(`${this.baseURL}/localidades/estados`).pipe(take(1));
  }
}
