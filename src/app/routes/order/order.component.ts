import { Component, OnInit, ViewChild } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  FormGroup,
  Validators,
} from '@angular/forms';
import { MatDialog } from '@angular/material/dialog';
import { MatTable } from '@angular/material/table';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Observable, Subject, debounceTime, map, startWith } from 'rxjs';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Color } from 'src/app/models/Color';
import { Customer } from 'src/app/models/Customer';
import { Fabric } from 'src/app/models/Fabric';
import { Item } from 'src/app/models/Item';
import { ItemOrder } from 'src/app/models/ItemOrder';
import { Order } from 'src/app/models/Order';
import { PaginatedResult } from 'src/app/models/Pagination';
import { Size } from 'src/app/models/Size';
import { User } from 'src/app/models/identity/User';
import { CustomerService } from 'src/app/services/customer.service';
import { ItemService } from 'src/app/services/item.service';
import { ItemOrderService } from 'src/app/services/itemOrder.service';
import { OrderService } from 'src/app/services/order.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';
import { formatHeader } from 'src/helpers/ColumnHeaders';

@Component({
  selector: 'app-order',
  templateUrl: './order.component.html',
  styleUrls: ['./order.component.scss'],
})
export class OrderComponent implements OnInit {
  @ViewChild(MatTable) table: MatTable<ItemOrder>;

  get itemOrders(): FormArray {
    return this.form.get('itemOrders') as FormArray;
  }

  form = this._formBuilder.group({
    customerId: [null],
    customer: ['', [Validators.required]],
    executorId: [null],
    executor: ['', [Validators.required]],
    orderedAt: [null as Date, [Validators.required]],
    deadline: [null as Date, [Validators.required]],
    description: [''],
    total: [0],
    itemOrders: this._formBuilder.array([]),
  });

  newItemOrder = this._formBuilder.group({
    itemId: [0],
    orderId: [0],
    item: ['', [Validators.required]],
    color: new FormControl({ value: '', disabled: true }, Validators.required),
    fabric: new FormControl({ value: '', disabled: true }, Validators.required),
    size: new FormControl({ value: '', disabled: true }, Validators.required),
    amount: new FormControl({ value: 0, disabled: true }, Validators.required),
    description: new FormControl({ value: '', disabled: true }),
    price: [0],
  });

  displayedColumns: string[] = [
    'item',
    'color',
    'fabric',
    'size',
    'amount',
    'price',
  ];

  requestMethod: string = 'post';
  order: Order;
  dataSource: any[] = [];
  customers: Customer[];
  filteredCustomers: Observable<any[]>;
  items: Item[];
  filteredItems: Observable<Item[]>;
  itemColors: Color[];
  itemFabrics: Fabric[];
  itemSizes: Size[];
  executors: User[];
  filteredExecutors: Observable<any[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _itemService: ItemService,
    private _orderService: OrderService,
    private _itemOrderService: ItemOrderService,
    private _customerService: CustomerService,
    private _userService: UserService,
    private _toastrService: ToastrService,
    private _spinner: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getItems();
    this.getCustomers();
    this.getExecutors();
    this.loadOrder();
  }

  private _filter(value: any, field: string) {
    const filterValue = value.toLowerCase();

    return this[field].filter((field) =>
      field.name.toLowerCase().includes(filterValue)
    );
  }

  public columnHeader(header: string): string {
    return formatHeader(header);
  }

  getCustomerId(event, customerId: number) {
    if (event.isUserInput) this.form.get('customerId')?.setValue(customerId);
  }
  getExecutorId(event, executorId: number) {
    if (event.isUserInput) this.form.get('executorId')?.setValue(executorId);
  }

  addItemOrder() {
    if (!this.newItemOrder.valid) {
      this._toastrService.warning(
        'Verifique os campos obrigatórios',
        'Campos inválidos'
      );
      return;
    }
    const itemOrder = this.newItemOrder.getRawValue();
    const total = this.form.get('total').value;
    itemOrder.price = itemOrder.price * itemOrder.amount;
    itemOrder.orderId = this.order?.id ?? 0;

    this.form
      .get('total')
      ?.setValue(parseFloat((total + itemOrder.price).toFixed(2)));
    this.addData(itemOrder);
    this.itemOrders.push(this.createItemOrder(itemOrder as any));

    this.newItemOrder.reset();
    this.disableAttributes();
  }

  createItemOrder(itemOrder: ItemOrder): FormGroup {
    return this._formBuilder.group({
      id: [itemOrder.id ?? 0],
      orderId: [itemOrder.orderId ?? 0],
      itemId: [itemOrder.itemId],
      colorId: [itemOrder.color.id, [Validators.required]],
      fabricId: [itemOrder.fabric.id, [Validators.required]],
      sizeId: [itemOrder.size.id, [Validators.required]],
      amount: [itemOrder.amount, [Validators.required]],
      description: [itemOrder.description],
    });
  }

  addData(itemOrder: any) {
    const dataToAdd = {
      id: itemOrder.id ?? 0,
      item: itemOrder.item,
      color: itemOrder.color.name,
      fabric: itemOrder.fabric.name,
      size: itemOrder.size.name,
      amount: itemOrder.amount,
      price: itemOrder.price,
    };
    this.dataSource.push(dataToAdd);
    this.table?.renderRows();
  }

  removeData(id: number, item: any) {
    console.log(item);
    const total = this.form.get('total').value;
    this.form
      .get('total')
      ?.setValue(parseFloat((total - item.price).toFixed(2)));

    if (item.id !== 0) {
      if (this.itemOrders.length === 1) {
        this._toastrService.warning(
          'Não é possível deletar o unico item do pedido.',
          'Não foi possível deletar'
        );
        return;
      }
      this._itemOrderService.delete(item.id).subscribe({
        next: (result: any) => {
          if (result.message === 'Deletado com sucesso') {
            const { customer, ...formValues } = this.form.getRawValue() as any;
            this.order = {
              id: this.order?.id ?? 0,
              ...formValues,
            };

            this._orderService.put(this.order).subscribe({
              next: () => {
                this._toastrService.success(
                  'Item deletado com sucesso',
                  'Item deletado'
                );
              },
              error: () => {
                this._toastrService.error(
                  'Não foi possível salvar o pedido',
                  'Erro ao salvar o pedido'
                );
              },
            });
          }
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível deletar o Item',
            'Erro ao deletar'
          );
        },
      });
    }

    this.itemOrders.removeAt(id);
    this.dataSource.splice(id, 1);
    this.table?.renderRows();
  }

  loadOrder() {
    const orderId = this._activeRoute.snapshot.paramMap.get('id');
    if (orderId === null) return;

    this._spinner.isLoading = true;
    this.requestMethod = 'put';

    this._orderService.getOrderById(+orderId).subscribe({
      next: (data: Order) => {
        this.order = data;

        this.form.patchValue({
          customer: this.order.customer.name,
          customerId: this.order.customer.id,
          executor: this.order.executor.name,
          executorId: this.order.executor.id,
          orderedAt: this.order.orderedAt,
          deadline: this.order.deadline,
          description: this.order.description,
          total: this.order.total,
        });

        for (let i = 0; i < this.order.itemOrders.length; i++) {
          this.itemOrders.push(this.createItemOrder(this.order.itemOrders[i]));

          const { item, ...itemOrderResponse } = this.order.itemOrders[i];

          this.addData({
            ...itemOrderResponse,
            item: item.name,
            price: item.price,
          });
        }
      },
      error: () =>
        this._toastrService.error(
          'Não foi possível carregar o pedido',
          'Erro ao carregar'
        ),
      complete: () => (this._spinner.isLoading = false),
    });
  }

  saveOrder() {
    if (!this.form.valid) {
      this._toastrService.warning(
        'Verifique os campos obrigatórios',
        'Campos inválidos'
      );
      return;
    }
    if (this.itemOrders.length === 0) {
      this._toastrService.warning(
        'Não é possível salvar um pedido sem itens',
        'Pedido inválido'
      );
      return;
    }

    this._spinner.isLoading = true;

    const { customer, executor, ...formValues } =
      this.form.getRawValue() as any;

    this.order = {
      id: this.order?.id ?? 0,
      createdAt:
        this.requestMethod === 'post' ? new Date() : this.order.createdAt,
      ...formValues,
    };

    this._orderService[this.requestMethod](this.order).subscribe({
      next: () => {
        this._toastrService.success(
          `${
            this.requestMethod === 'post' ? 'Cadastrado' : 'Salvo'
          } com sucesso`,
          'Pedido salvo com sucesso'
        );
        this.form.reset();
        this.itemOrders.clear();
        this.newItemOrder.reset();
        this.dataSource = [];
        this.disableAttributes();
        this._router.navigate(['./order']);
      },
      error: () =>
        this._toastrService.error(
          'Erro ao cadastrar o pedido',
          'Erro ao Cadastrar'
        ),
      complete: () => (this._spinner.isLoading = false),
    });
  }

  deleteOrder() {
    this._orderService.deleteOrder(this.order.id).subscribe({
      next: () => {
        this._toastrService.success(
          'Pedido deletado com sucesso',
          'Deletado com sucesso'
        );
        this._router.navigate(['/dashboard/orders']);
      },
      error: () =>
        this._toastrService.error(
          'Erro ao deletar o pedido',
          'Erro ao deletar'
        ),
    });
  }

  getItems() {
    this._itemService.getItems().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.filteredItems = this.newItemOrder.get('item').valueChanges.pipe(
          startWith(''),
          map((value) => this._filter(value || '', 'items'))
        );
      },
      error: () =>
        this._toastrService.error(
          'Erro ao carregar os modelos',
          'Erro ao carregar'
        ),
    });
  }

  getExecutors() {
    this._userService.getExecutors().subscribe({
      next: (data: any) => {
        this.executors = data;
        this.filteredExecutors = this.form.get('executor').valueChanges.pipe(
          startWith(''),
          map((value) => this._filter(value || '', 'executors'))
        );
      },
      error: () =>
        this._toastrService.error('Não foi possível encontrar confeccionistas'),
    });
  }

  getCustomers() {
    this._customerService.getCustomers(1, 25).subscribe({
      next: (data: PaginatedResult<any>) => {
        this.customers = data.result.$values as Customer[];
        this.filteredCustomers = this.form.get('customer').valueChanges.pipe(
          startWith(''),
          debounceTime(1000),
          map((value) => {
            console.log(value);

            if (value.length > 0) {
              let teste: any[];
              this._customerService
                .getCustomers(1, 25, value)
                .subscribe((data: PaginatedResult<any>) => {
                  teste = data.result.$values;
                  console.log(teste);
                  return teste;
                });
            }

            console.log(this.customers);
            return this.customers;
          })
        );
      },
      error: () =>
        this._toastrService.error(
          'Erro ao carregar os clientes',
          'Erro ao carregar'
        ),
    });
  }

  async getItemAttributes(event, itemId: number) {
    if (event.isUserInput === false) return;
    const itemResponse = (await this._itemService.getItemAttributes(
      itemId
    )) as Item;

    const newItemOrder = this.newItemOrder as FormGroup;
    let colors: Color[] = [];
    let fabrics: Fabric[] = [];
    let sizes: Size[] = [];

    newItemOrder.get('itemId')?.setValue(itemId);
    newItemOrder.get('price')?.setValue(itemResponse.price);

    for (let i = 0; i < itemResponse.itemColors.length; ++i) {
      colors.push(itemResponse.itemColors[i].color);
    }

    for (let i = 0; i < itemResponse.itemFabrics.length; ++i) {
      fabrics.push(itemResponse.itemFabrics[i].fabric);
    }

    for (let i = 0; i < itemResponse.itemSizes.length; ++i) {
      sizes.push(itemResponse.itemSizes[i].size);
    }

    this.enableAttributes();

    this.itemColors = colors;
    this.itemFabrics = fabrics;
    this.itemSizes = sizes;
  }

  openModalItem(item: any, id: number) {
    this._dialog.open(DialogComponent, {
      data: {
        title: `Deseja excluir o item ${item.item}? `,
        content: 'Tem certeza qeu deseja excluir o item do pedido?',
        action: () => {
          this.removeData(id, item);
        },
      },
    });
  }

  openModalOrder() {
    this._dialog.open(DialogComponent, {
      data: {
        title: `Deseja excluir o pedido? `,
        content: 'Tem certeza qeu deseja excluir o pedido?',
        action: () => {
          this.deleteOrder();
        },
      },
    });
  }

  enableAttributes() {
    this.newItemOrder.get('color').enable();
    this.newItemOrder.get('fabric').enable();
    this.newItemOrder.get('size').enable();
    this.newItemOrder.get('amount').enable();
    this.newItemOrder.get('description').enable();
  }

  disableAttributes() {
    this.newItemOrder.get('color').disable();
    this.newItemOrder.get('fabric').disable();
    this.newItemOrder.get('size').disable();
    this.newItemOrder.get('amount').disable();
    this.newItemOrder.get('description').disable();
  }
}
