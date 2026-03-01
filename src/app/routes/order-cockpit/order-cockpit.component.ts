import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { OrderService } from '../../services/order.service';
import { SpinnerService } from '../../services/spinner.service';
import { DialogCarouselComponent } from '../../components/dialogCarousel/dialogCarousel.component';
import { environment } from 'src/environments/environment';
import { RemoveAccents } from 'src/helpers/RemoveAccents';

@Component({
  selector: 'app-order-cockpit',
  templateUrl: './order-cockpit.component.html',
  styleUrls: ['./order-cockpit.component.scss'],
})
export class OrderCockpitComponent implements OnInit {
  currentOrder: any;
  currentStep: number = 0;
  nextOrders: any[] = [];
  filteredNextOrders: any[] = [];
  showNextOrders: boolean = false;
  filterValue: string = '';
  imageAPI = environment.imageAPI;

  public steps = [
    { label: 'Aguardando', value: 0 },
    { label: 'Corte', value: 1 },
    { label: 'Fechamento', value: 2 },
    { label: 'Finalização', value: 3 },
    { label: 'Pronto', value: 4 },
  ];

  constructor(
    private _route: ActivatedRoute,
    private _router: Router,
    private _orderService: OrderService,
    private _dialog: MatDialog,
    private _spinner: SpinnerService,
    private _toastr: ToastrService
  ) {}

  ngOnInit(): void {
    this.loadOrder();
    this.loadNextOrders();
  }

  loadOrder(): void {
    const orderId = this._route.snapshot.paramMap.get('id');
    if (!orderId) {
      this._toastr.error('ID do pedido não encontrado', 'Erro');
      this._router.navigate(['/dashboard/orders']);
      return;
    }

    this._orderService
      .getOrderById(+orderId)
      .subscribe({
        next: (data: any) => {
          console.log('Order loaded:', data);
          console.log('Step value:', data.step, 'Type:', typeof data.step);
          this.currentOrder = data;
          this.currentStep = this.getCurrentStep();
          console.log('Current step:', this.currentStep);
          console.log('Steps length:', this.steps.length);
        },
        error: () => {
          this._toastr.error(
            'Não foi possível carregar o pedido',
            'Erro ao carregar'
          );
          this._router.navigate(['/dashboard/orders']);
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  loadNextOrders(): void {
    this._orderService.getPendingOrders().subscribe({
      next: (data: any) => {
        // Filter only pending orders (step < 4) and sort by deadline
        this.nextOrders = data
          .sort(
            (a: any, b: any) =>
              new Date(a.deadline).getTime() - new Date(b.deadline).getTime()
          )
          .slice(0, 5); // Get only next 5 orders
        this.filteredNextOrders = [...this.nextOrders];
        console.log('Next orders:', this.nextOrders);
      },
      error: () => {
        this._toastr.error(
          'Não foi possível carregar os próximos pedidos',
          'Erro ao carregar'
        );
      },
    });
  }

  toggleNextOrders(): void {
    this.showNextOrders = !this.showNextOrders;
  }

  filterOrders(value: string): void {
    this.filterValue = value;
    if (!value.trim()) {
      this.filteredNextOrders = [...this.nextOrders];
      return;
    }

    const searchTerm = RemoveAccents(value.trim().toLowerCase());
    this.filteredNextOrders = this.nextOrders.filter((order) => {
      const customerName = RemoveAccents(order.customer.name.toLowerCase());
      return customerName.includes(searchTerm);
    });
  }

  selectOrder(orderId: number): void {
    this._router.navigate(['/order-cockpit', orderId]).then(() => {
      this.showNextOrders = false;
      this.filterValue = '';
      this.loadOrder();
      this.loadNextOrders();
    });
  }

  updateStep(): void {
    if (!this.currentOrder) return;

    const nextStep = this.currentStep + 1;

    this._orderService.updateOrder(this.currentOrder.id, nextStep).subscribe({
      next: () => {
        this._toastr.success(
          'Etapa atualizada com sucesso',
          'Etapa atualizada'
        );
        this.loadOrder();
        this.loadNextOrders();
      },
      error: (error) => {
        console.error('Error updating step:', error);
        this._toastr.error('Erro ao atualizar a etapa', 'Erro ao atualizar');
      },
    })
    .add(() => (this._spinner.isLoading = false));
  }

  openCarousel(imageURL: string): void {
    this._dialog.open(DialogCarouselComponent, {
      data: {
        title: 'Fotos do Modelo',
        imageURL: imageURL,
      },
    });
  }

  getCurrentStep(): number {
    return this.steps.findIndex(step => step.label.trim().toLowerCase() === this.currentOrder.step.trim().toLowerCase());
  }

  getNextStepLabel(): string {
    if (!this.currentOrder) return '';
    const nextStep = this.steps.findIndex(step => step.label.trim().toLowerCase() === this.currentOrder.step.trim().toLowerCase()) + 1;
    return this.steps[nextStep]?.label || '';
  }

  isUrgent(deadline: Date): boolean {
    if (!this.currentOrder) return false;
    const todayPlus7 = new Date();
    todayPlus7.setDate(new Date().getDate() + 7);
    return new Date(deadline) <= todayPlus7;
  }

  getProgressPercentage(): number {
    if (!this.currentOrder) return 0;
    return (this.currentOrder.step / (this.steps.length - 1)) * 100;
  }

  getMeasurementsForItemOrder(itemOrder: any): any[] {
    // Find the ItemSize that matches the current size
    const itemSize = itemOrder.item.itemSizes?.find(
      (is: any) => is.sizeId === itemOrder.size.id
    );
    return itemSize?.measurements || [];
  }
}
