import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Set } from 'src/app/models/Set';
import { AttributeService } from 'src/app/services/attribute.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-set',
  templateUrl: './set.component.html',
  styleUrls: ['./set.component.scss'],
})
export class SetComponent implements OnInit {
  public sets: Set[];
  public inactiveSets: Set[];
  set: Set = { id: 0, name: '' };
  requestMethod = 'post';

  constructor(
    private _attributeService: AttributeService,
    private _toastrService: ToastrService,
    private _spinnerService: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getSets();
  }

  getSets() {
    this._spinnerService.isLoading = true;
    this._attributeService.setAttribute('set');

    this._attributeService
      .getAttributes()
      .subscribe({
        next: (data: Set[]) => {
          if (data?.length > 0) {
            this.sets = data.filter((set) => set.isActive);
            this.inactiveSets = data.filter((set) => !set.isActive);
          }
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível listar os Conjuntos',
            'Erro ao Listar'
          );
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  saveSet() {
    this._attributeService[this.requestMethod](this.set).subscribe({
      next: () => {
        this._toastrService.success(
          'Conjunto cadastrado com sucesso',
          'Cadastrado com sucesso'
        );

        this.getSets();
        this.clearSet();
      },
      error: () => {
        this._toastrService.error(
          'Houve um erro inesperado',
          'Erro ao cadastrar'
        );
      },
    });
  }

  clearSet() {
    this.set.id = 0;
    this.set.name = '';
    this.requestMethod = 'post';
  }

  loadSet(id: number) {
    this._attributeService.getAttributeById(id).subscribe({
      next: (data: Set) => {
        this.set.id = data.id;
        this.set.name = data.name;

        this.requestMethod = 'put';
      },
      error: () =>
        this._toastrService.error(
          'Não foi possível carregar o Conjunto',
          'Erro ao carregar'
        ),
    });
  }

  openModal(id: number, name: string) {
    this._attributeService.checkFK(id).subscribe({
      next: (data: boolean) => {
        if (data === true) {
          this._dialog.open(DialogComponent, {
            data: {
              title: `Deseja inativar o conjunto ${name}?`,
              content: `Existem modelos com este conjunto, sua exclusão não será possível.
                Deseja inativar?`,
              action: () => this.setActiveState(id, false),
            },
          });
        } else {
          this._dialog.open(DialogComponent, {
            data: {
              title: `Deseja excluir o conjunto ${name}?`,
              content: 'Tem certeza que deseja excluir o conjunto?',
              action: () => this.deleteSet(id),
            },
          });
        }
      },
      error: (error: HttpErrorResponse) =>
        this._toastrService.error(error.error),
    });
  }

  setActiveState(id: number, state: boolean) {
    this._attributeService.setActiveState(id, state).subscribe({
      next: (data: HttpResponse<Set>) => {
        if (data.status === 200) {
          if (data.body.isActive === state) {
            if (state === false) {
              this._toastrService.success('Conjunto inativado');
            } else {
              this._toastrService.success('Conjunto habilitado');
            }
          } else {
            this._toastrService.warning('O conjunto não foi alterado');
          }
        } else {
          this._toastrService.warning(
            'Houve um problema ao alterar o conjunto'
          );
        }
        this.getSets();
      },
      error: (error: HttpErrorResponse) =>
        this._toastrService.error(error.error, 'Erro ao alterar o conjunto'),
    });
  }

  deleteSet(id: number) {
    this._attributeService.delete(id).subscribe({
      next: () => {
        this._toastrService.success(
          'Conjunto deletado com sucesso',
          'Deletado com sucesso'
        );
        this.getSets();
      },
      error: () => {
        this._toastrService.error(
          'Não foi possível deletar o conjunto',
          'Erro ao deletar'
        );
      },
    });
  }
}
