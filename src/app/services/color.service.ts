import { Injectable } from '@angular/core';
import { AttributeService } from './attribute.service';
import { ToastrService } from 'ngx-toastr';

import { Color } from '../models/Color';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class ColorService {
  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService
  ) {}

  getColors(): Observable<Color[]> {
    this._attributeService.setAttribute('color');

    return this._attributeService.getAttributes().pipe(
      catchError(() => {
        this._toastrService.error('Erro ao buscar as cores', 'Erro ao listar');
        return [];
      })
    );
  }
}
