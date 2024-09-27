import { Injectable } from '@angular/core';
import { AttributeService } from './attribute.service';
import { ToastrService } from 'ngx-toastr';

import { Size } from '../models/Size';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SizeService {
  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService
  ) {}

  getSizes(): Observable<Size[]> {
    this._attributeService.setAttribute('size');

    return this._attributeService.getAttributes().pipe(
      catchError(() => {
        this._toastrService.error('Erro ao buscar as cores', 'Erro ao listar');
        return [];
      })
    );
  }
}
