import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Customer } from 'src/app/models/Customer';
import { CustomerService } from 'src/app/services/customer.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  public customers: Customer[] = [];
  searchTerm: Subject<string> = new Subject<string>();

  constructor(
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
    private _dialog: MatDialog,
    private _spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    this.getCustomers();
  }

  getCustomers(): void {
    this._spinnerService.isLoading = true;

    this._customerService
      .getCustomers('')
      .subscribe({
        next: (data: Customer[]) => {
          this.customers = data;
        },
        error: (error) => {
          console.log(error);
          this._toastrService.error(
            'Não foi possível listar os clientes',
            'Erro de conexão'
          );
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  filterCustomers(value: string) {
    if (!this.searchTerm.observed) {
      this._spinnerService.isLoading = true;

      this.searchTerm.pipe(debounceTime(1000)).subscribe((term) => {
        this._customerService
          .getCustomers(term)
          .subscribe({
            next: (data: Customer[]) => {
              this.customers = data;
            },
            error: (error) => {
              console.log(error);
              this._toastrService.error(
                'Não foi possível listar os clientes',
                'Erro de conexão'
              );
            },
          })
          .add(() => (this._spinnerService.isLoading = false));
      });
    }

    this.searchTerm.next(value);
  }

  openModal(id: number, name: string) {
    this._dialog.open(DialogComponent, {
      data: {
        title: `Deseja excluir o(a) cliente ${name}?`,
        content: 'Tem certeza qeu deseja excluir o(a) cliente?',
        action: () => {
          this._customerService.deleteCustomer(id).subscribe({
            next: (result: any) => {
              if (result.message === 'Deletado com sucesso') {
                this._toastrService.success(
                  'Cliente deletado com sucesso',
                  'Cliente deletado'
                );
                this.getCustomers();
              }
            },
            error: (error) => {
              console.log(error);
              this._toastrService.error(
                'Não foi possível deletar o cliente',
                'Erro ao deletar'
              );
            },
            complete: () => {},
          });
        },
      },
    });
  }
}
