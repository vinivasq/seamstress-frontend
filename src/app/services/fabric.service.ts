import { Injectable } from '@angular/core';
import { AttributeService } from './attribute.service';
import { ToastrService } from 'ngx-toastr';

import { Fabric } from '../models/Fabric';
import { catchError, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class FabricService {
  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService
  ) {}

  getFabrics(): Observable<Fabric[]> {
    this._attributeService.setAttribute('fabric');

    return this._attributeService.getAttributes().pipe(
      catchError(() => {
        this._toastrService.error('Erro ao buscar as cores', 'Erro ao listar');
        return [];
      })
    );
  }
}
