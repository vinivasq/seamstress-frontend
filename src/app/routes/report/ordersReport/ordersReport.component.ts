import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { ToastrService } from 'ngx-toastr';
import { Observable, debounceTime, map, startWith, switchMap } from 'rxjs';
import { DialogCarouselComponent } from 'src/app/components/dialogCarousel/dialogCarousel.component';
import { Customer } from 'src/app/models/Customer';
import { Order } from 'src/app/models/Order';
import { OrderParams } from 'src/app/models/OrderParams';
import { PageParams } from 'src/app/models/PageParams';
import { PaginatedResult, Pagination } from 'src/app/models/Pagination';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { environment } from 'src/environments/environment';
import { formatHeader } from 'src/helpers/ColumnHeaders';

@Component({
  selector: 'app-ordersReport',
  templateUrl: './ordersReport.component.html',
  styleUrls: ['./ordersReport.component.scss'],
  animations: [
    trigger('detailExpand', [
      state('collapsed', style({ height: '0px', minHeight: '0' })),
      state('expanded', style({ height: '*' })),
      transition(
        'expanded <=> collapsed',
        animate('225ms cubic-bezier(0.4, 0.0, 0.2, 1)')
      ),
    ]),
  ],
})
export class OrdersReportComponent implements OnInit {
  public dataSource: any;
  public foundOrders = false;
  public searched = false;
  public pagination = {
    currentPage: 0,
    pageSize: 10,
    totalItems: 1,
  } as Pagination;
  displayedColumns: string[] = [
    'id',
    'customer',
    'orderedAt',
    'deadline',
    'total',
    'step',
  ];
  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];
  expandedOrder?: Order | null;
  imageAPI = environment.imageAPI;
  steps = [
    { label: 'Aguardando', value: 0 },
    { label: 'Corte', value: 1 },
    { label: 'Fechamento', value: 2 },
    { label: 'Finalização', value: 3 },
    { label: 'Pronto', value: 4 },
    { label: 'Entregue', value: 5 },
  ];
  customers: Observable<Customer[]>;
  today = new Date();
  dateMinusSeven = new Date();

  get range(): FormGroup {
    return this.form.get('range') as FormGroup;
  }

  form = this._formBuilder.group({
    customerId: [null],
    customer: [null],
    range: new FormGroup({
      start: new FormControl<Date | null>(
        this.dateMinusSeven,
        Validators.required
      ),
      end: new FormControl<Date | null>(this.today, Validators.required),
    }),
    steps: [[5]],
  });

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private _formBuilder: FormBuilder,
    private _orderService: OrderService,
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
    private _dialog: MatDialog,
    private _spinnerService: SpinnerService
  ) {
    this.dateMinusSeven.setDate(new Date().getDate() - 7);
    this.dateMinusSeven.setHours(0, 0, 0, 0);
    this.today.setHours(0, 0, 0, 0);
  }

  ngOnInit() {
    this.getCustomers();
  }

  searchOrders() {
    if (!this.form.valid) {
      this._toastrService.warning('Campos inválidos');
      return;
    }

    this._spinnerService.isLoading = true;
    this.searched = true;

    const { customer, ...formValues } = this.form.getRawValue();
    const orderParams = new OrderParams(
      this.pagination.currentPage,
      this.pagination.pageSize
    );
    orderParams.customerId = formValues.customerId;
    orderParams.orderedAtStart = formValues.range.start;
    orderParams.orderedAtEnd = formValues.range.end;
    orderParams.steps = formValues.steps;

    this._orderService
      .getOrders(orderParams)
      .subscribe({
        next: (data) => {
          if (data.result) {
            this.dataSource = new MatTableDataSource(data.result);
            this.foundOrders = true;
            this.pagination = data.pagination;
            this.dataSource.sort = this.sort;
          } else {
            this.dataSource = null;
            this.pagination = {
              currentPage: 0,
              pageSize: 10,
              totalItems: 1,
            } as Pagination;
            this.foundOrders = false;
            this._toastrService.info('Nenhum pedido encontrado');
          }
        },
        error: (err: any) => {
          this._toastrService.error('Erro ao buscar pedidos');
          console.log(err);
        },
      })
      .add(() => (this._spinnerService.isLoading = false));
  }

  getCustomers() {
    this.customers = this.form.get('customer').valueChanges.pipe(
      startWith(''),
      debounceTime(1000),
      switchMap((value) => {
        return this.filterCustomers(value);
      })
    );
  }

  filterCustomers(value: string): Observable<Customer[]> {
    return this._customerService
      .getCustomers(new PageParams(0, 25, value))
      .pipe(
        map((data: PaginatedResult<Customer[]>) => {
          if (data.result == null) {
            this._toastrService.warning(
              'Revise os termos de busca',
              'Nenhum cliente encontrado'
            );
          }

          return data.result;
        })
      );
  }

  getCustomerId(event, customerId: number) {
    if (event.isUserInput) this.form.get('customerId')?.setValue(customerId);
  }

  pageChange(event: PageEvent) {
    this.pagination.currentPage = event.pageIndex;
    this.pagination.pageSize = event.pageSize;

    this.searchOrders();
  }

  checkCustomerValue() {
    if (this.form.get('customer').value === '')
      this.form.get('customerId').patchValue(null);
  }

  public openCarousel(imageURL: string) {
    this._dialog.open(DialogCarouselComponent, {
      data: {
        title: `Fotos do Modelo`,
        imageURL: imageURL,
      },
    });
  }

  public columnHeader(header: string): string {
    return formatHeader(header);
  }
}
