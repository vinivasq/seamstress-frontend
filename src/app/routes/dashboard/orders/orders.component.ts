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
import { DialogComponent } from '../../../components/dialog/dialog.component';
import { DialogCarouselComponent } from 'src/app/components/dialogCarousel/dialogCarousel.component';
import { MatDialog } from '@angular/material/dialog';
import { environment } from 'src/environments/environment';

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
  public steps = {
    Aguardando: 0,
    Corte: 1,
    Fechamento: 2,
    Finalização: 3,
    Pronto: 4,
  };
  displayedColumns: string[] = [
    'id',
    'customer',
    'createdAt',
    'deadline',
    'total',
    'step',
  ];
  displayedColumnsWithExpand = [...this.displayedColumns, 'expand'];
  expandedOrder?: Order | null;
  imageAPI = environment.imageAPI;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private orderService: OrderService,
    private dialog: MatDialog,
    private spinner: SpinnerService,
    private toastr: ToastrService
  ) {}

  filterOrders(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  public columnHeader(header: string): string {
    return formatHeader(header);
  }

  public openCarousel(imageURL: string) {
    this.dialog.open(DialogCarouselComponent, {
      data: {
        title: `Fotos do Modelo`,
        imageURL: imageURL,
      },
    });
  }

  public openDialog(id: number) {
    this.dialog.open(DialogComponent, {
      data: {
        title: `Deseja excluir o pedido ${id}?`,
        content: 'Tem certeza que deseja excluir o pedido?',
        action: () => {
          this.orderService.deleteOrder(id).subscribe({
            next: (result: any) => {
              if (result.message === 'Deletado com sucesso') {
                this.toastr.success(
                  'Pedido deletado com sucesso',
                  'Pedido deletado'
                );

                this.getOrders();
              }
            },
            error: (error) => {
              console.log(error);
              this.toastr.error(
                'Erro ao deletar',
                'Ocorreu um erro ao deletar o pedido'
              );
            },
            complete: () => {},
          });
        },
      },
    });
  }

  ngOnInit() {
    this.getOrders();
  }

  public updateStep(orderId: number, step: number) {
    this.orderService.updateOrder(orderId, step).subscribe({
      next: () => {
        this.toastr.success('Etapa atualizada com sucesso', 'Etapa atualizada');
        this.getOrders();
      },
      error: () =>
        this.toastr.error('Erro ao atualizar a etapa', 'Erro ao atualizar'),
    });
  }

  public getOrders(): void {
    this.spinner.isLoading = true;

    this.orderService
      .getOrders()
      .subscribe({
        next: (data: any): void => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
          this.dataSource.filterPredicate = (data, filter) => {
            const dataStr = data.customer.name + data.description;
            return dataStr.indexOf(filter) != -1;
          };
        },
        error: (err: any) => {
          console.log(err);
          this.toastr.error(
            'Não foi possível listar os pedidos',
            'Erro de conexão'
          );
        },
      })
      .add(() => (this.spinner.isLoading = false));
  }
}
