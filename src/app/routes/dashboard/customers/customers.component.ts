import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Customer } from 'src/app/models/Customer';
import { PaginatedResult, Pagination } from 'src/app/models/Pagination';
import { CustomerService } from 'src/app/services/customer.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements OnInit {
  public customers: Customer[] = [];
  public pagination = {} as Pagination;
  searchTerm: Subject<string> = new Subject<string>();

  constructor(
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
    private _dialog: MatDialog,
    private _spinnerService: SpinnerService
  ) {}

  ngOnInit() {
    this.pagination = {
      currentPage: 1,
      pageSize: 10,
      totalItems: 1,
    } as Pagination;

    this.getCustomers();
  }

  getCustomers(): void {
    this._spinnerService.isLoading = true;

    this._customerService
      .getCustomers(this.pagination.currentPage, this.pagination.pageSize)
      .subscribe({
        next: (data: PaginatedResult<any>) => {
          this.customers = data.result;
          this.pagination = data.pagination;

          console.log(data);
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

  pageChange(event: { pageIndex: number; pageSize: number }) {
    this.pagination.currentPage = ++event.pageIndex;
    this.pagination.pageSize = event.pageSize;
    this.getCustomers();
  }

  filterCustomers(value: string) {
    if (!this.searchTerm.observed) {
      this._spinnerService.isLoading = true;

      this.searchTerm.pipe(debounceTime(1000)).subscribe((term) => {
        this._customerService
          .getCustomers(
            this.pagination.currentPage,
            this.pagination.pageSize,
            term
          )
          .subscribe({
            next: (data: PaginatedResult<any>) => {
              this.customers = data.result;
              this.pagination = data.pagination;

              console.log(data);
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
