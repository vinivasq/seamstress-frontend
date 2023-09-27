import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { take } from 'rxjs';
import { environment } from 'src/environments/environment';

@Injectable({
  providedIn: 'root',
})
export class ItemOrderService {
  private _baseURL = `${environment.apiURL}/ItemOrder`;

  constructor(private client: HttpClient) {}

  delete(id: number) {
    return this.client.delete(`${this._baseURL}/${id}`).pipe(take(1));
  }
}
