import { Injectable } from '@angular/core';
import { AttributeService } from './attribute.service';
import { ToastrService } from 'ngx-toastr';

import { Set } from '../models/Set';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class SetService {
  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService
  ) {}

  getSets(): Observable<Set[]> {
    this._attributeService.setAttribute('set');

    return this._attributeService.getAttributes().pipe(
      catchError(() => {
        this._toastrService.error(
          'Erro ao buscar os conjuntos',
          'Erro ao listar'
        );
        return [];
      })
    );
  }

  filterSets(value: string, sets: Set[]): Set[] {
    return sets.filter((set) =>
      set.name.toLowerCase().includes(value.toLowerCase())
    );
  }
}
