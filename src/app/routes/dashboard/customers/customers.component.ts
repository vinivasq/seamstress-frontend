import { AfterViewInit, Component, ViewChild } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { PageEvent } from '@angular/material/paginator';
import { ToastrService } from 'ngx-toastr';
import { Subject, debounceTime } from 'rxjs';
import { TableHeaderComponent } from 'src/app/components/tableHeader/tableHeader.component';
import { Customer } from 'src/app/models/Customer';
import { PageParams } from 'src/app/models/PageParams';
import { PaginatedResult, Pagination } from 'src/app/models/Pagination';
import { CustomerService } from 'src/app/services/customer.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
})
export class CustomersComponent implements AfterViewInit {
  @ViewChild(TableHeaderComponent) tableHeaderComponent: TableHeaderComponent;

  public customers: Customer[] = [];
  public pagination = {
    currentPage: 0,
    pageSize: 8,
    totalItems: 1,
  } as Pagination;
  searchTerm: Subject<string> = new Subject<string>();

  constructor(
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
    private _spinnerService: SpinnerService
  ) {}

  ngAfterViewInit() {
    this.getCustomers();
  }

  getCustomers(): void {
    this._spinnerService.isLoading = true;

    this._customerService
      .getCustomers(
        new PageParams(
          this.pagination.currentPage,
          this.pagination.pageSize,
          this.tableHeaderComponent.filterValue
        )
      )
      .subscribe({
        next: (data: PaginatedResult<any>) => {
          this.customers = data.result;
          this.pagination = data.pagination;
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

  pageChange(event: PageEvent) {
    this.pagination.currentPage = event.pageIndex;
    this.pagination.pageSize = event.pageSize;

    this.getCustomers();
  }

  filterCustomers(value: string) {
    this.pagination.currentPage = 0;

    if (!this.searchTerm.observed) {
      this.searchTerm.pipe(debounceTime(1000)).subscribe((term) => {
        this._spinnerService.isLoading = true;
        this._customerService
          .getCustomers(
            new PageParams(
              this.pagination.currentPage,
              this.pagination.pageSize,
              term
            )
          )
          .subscribe({
            next: (data: PaginatedResult<any>) => {
              if (data.result == null) {
                this._toastrService.warning(
                  'Revise os termos de busca',
                  'Nenhum cliente encontrado'
                );
                return;
              }

              this.customers = data.result;
              this.pagination = data.pagination;
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

    this.searchTerm.next(value.trim());
  }
}
