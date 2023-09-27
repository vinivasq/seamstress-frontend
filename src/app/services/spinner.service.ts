import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SpinnerService {
  constructor() {}

  public isLoading: boolean = false;
}
