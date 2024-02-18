import { Component, OnInit } from '@angular/core';
import {
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ToastrService } from 'ngx-toastr';
import { Observable, debounceTime, map, startWith, switchMap } from 'rxjs';
import { Customer } from 'src/app/models/Customer';
import { OrderParams } from 'src/app/models/OrderParams';
import { PageParams } from 'src/app/models/PageParams';
import { PaginatedResult } from 'src/app/models/Pagination';
import { CustomerService } from 'src/app/services/customer.service';
import { OrderService } from 'src/app/services/order.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-ordersReport',
  templateUrl: './ordersReport.component.html',
  styleUrls: ['./ordersReport.component.scss'],
})
export class OrdersReportComponent implements OnInit {
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

  constructor(
    private _formBuilder: FormBuilder,
    private _orderService: OrderService,
    private _customerService: CustomerService,
    private _toastrService: ToastrService,
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

    const { customer, ...formValues } = this.form.getRawValue();
    const orderParams = new OrderParams(0, 25);
    orderParams.customerId = formValues.customerId;
    orderParams.orderedAtStart = formValues.range.start;
    orderParams.orderedAtEnd = formValues.range.end;
    orderParams.steps = formValues.steps;

    this._orderService
      .getOrders(orderParams)
      .subscribe({
        next: (data) => {
          console.log(data);
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
}
