import { Component, OnInit, ViewChild } from '@angular/core';
import {
  animate,
  state,
  style,
  transition,
  trigger,
} from '@angular/animations';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { Order } from '../../../models/Order';
import { formatHeader } from 'src/helpers/ColumnHeaders';
import { SpinnerService } from '../../../services/spinner.service';
import { OrderService } from '../../../services/order.service';
import { ToastrService } from 'ngx-toastr';
import { DialogCarouselComponent } from 'src/app/components/dialogCarousel/dialogCarousel.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';
import { UserService } from 'src/app/services/user.service';
import { User } from 'src/app/models/identity/User';
import { RemoveAccents } from 'src/helpers/RemoveAccents';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
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
export class OrdersComponent implements OnInit {
  public dataSource: any;
  public foundOrders = false;
  public steps = [
    { label: 'Aguardando', value: 0 },
    { label: 'Corte', value: 1 },
    { label: 'Fechamento', value: 2 },
    { label: 'Finalização', value: 3 },
    { label: 'Pronto', value: 4 },
  ];
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
  user: User;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private _userService: UserService,
    private _orderService: OrderService,
    private _dialog: MatDialog,
    private _spinner: SpinnerService,
    private _toastr: ToastrService
  ) {}

  filterOrders(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  public columnHeader(header: string): string {
    return formatHeader(header);
  }

  ngOnInit() {
    this.getPendingOrders();

    this._userService.currentUser$.subscribe(
      (data: User) => (this.user = data)
    );
  }

  public updateStep(orderId: number, step: number) {
    this._orderService.updateOrder(orderId, step).subscribe({
      next: () => {
        this._toastr.success(
          'Etapa atualizada com sucesso',
          'Etapa atualizada'
        );
        this.getPendingOrders();
      },
      error: () =>
        this._toastr.error('Erro ao atualizar a etapa', 'Erro ao atualizar'),
    });
  }

  public getPendingOrders(): void {
    this._spinner.isLoading = true;

    this._orderService
      .getPendingOrders()
      .subscribe({
        next: (data: any): void => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = (data, filter: string) => {
            filter = RemoveAccents(filter);
            const dataStr = RemoveAccents(data.customer.name);
            return dataStr.indexOf(filter) != -1;
          };
          if (data.length > 0) this.foundOrders = true;
        },
        error: () => {
          this._toastr.error(
            'Não foi possível listar os pedidos',
            'Erro de conexão'
          );
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  public SetBadge(deadLine: Date, column: string): boolean {
    if (column === 'customer') {
      let todayPlus7 = new Date();
      todayPlus7.setDate(new Date().getDate() + 7);

      if (todayPlus7 <= new Date(deadLine)) return true;
      return false;
    }
    return true;
  }

  public openCarousel(imageURL: string) {
    this._dialog.open(DialogCarouselComponent, {
      data: {
        title: `Fotos do Modelo`,
        imageURL: imageURL,
      },
    });
  }
}
