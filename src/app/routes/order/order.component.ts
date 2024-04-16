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
import { Observable, debounceTime, map, startWith, switchMap } from 'rxjs';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { Color } from 'src/app/models/Color';
import { Customer } from 'src/app/models/Customer';
import { Fabric } from 'src/app/models/Fabric';
import { Item } from 'src/app/models/Item';
import { ItemOrder } from 'src/app/models/ItemOrder';
import { Order } from 'src/app/models/Order';
import { PageParams } from 'src/app/models/PageParams';
import { PaginatedResult } from 'src/app/models/Pagination';
import { SalePlatform } from 'src/app/models/SalePlatform';
import { Size } from 'src/app/models/Size';
import { User } from 'src/app/models/identity/User';
import { CustomerService } from 'src/app/services/customer.service';
import { ItemService } from 'src/app/services/item.service';
import { ItemOrderService } from 'src/app/services/itemOrder.service';
import { OrderService } from 'src/app/services/order.service';
import { SalePlatformService } from 'src/app/services/salePlatform.service';
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
    salePlatformId: [null],
    salePlatform: ['', [Validators.required]],
    orderedAt: [null as Date, [Validators.required]],
    deadline: [null as Date, [Validators.required]],
    description: [''],
    total: [0],
    itemOrders: this._formBuilder.array([]),
  });

  itemOrder = this._formBuilder.group({
    id: [0],
    orderId: [0],
    itemId: [null, [Validators.required]],
    item: ['', [Validators.required]],
    colorId: new FormControl(
      { value: null, disabled: true },
      Validators.required
    ),
    fabricId: new FormControl(
      { value: null, disabled: true },
      Validators.required
    ),
    sizeId: new FormControl(
      { value: null, disabled: true },
      Validators.required
    ),
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
  customers: Observable<Customer[]>;
  items: Item[];
  filteredItems: Observable<Item[]>;
  itemColors: Color[];
  itemFabrics: Fabric[];
  itemSizes: Size[];
  executors: User[];
  filteredExecutors: Observable<any[]>;
  salePlatforms: SalePlatform[];

  constructor(
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _itemService: ItemService,
    private _orderService: OrderService,
    private _itemOrderService: ItemOrderService,
    private _customerService: CustomerService,
    private _userService: UserService,
    private _salePlatformService: SalePlatformService,
    private _toastrService: ToastrService,
    private _spinner: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getItems();
    this.getCustomers();
    this.getExecutors();
    this.getSalePlatforms();
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
  getSalePlatformId(event, salePlatformId: number) {
    if (event.isUserInput)
      this.form.get('salePlatformId')?.setValue(salePlatformId);
  }

  addItemOrder() {
    if (!this.itemOrder.valid) {
      this._toastrService.warning(
        'Verifique os campos obrigatórios',
        'Campos inválidos'
      );
      return;
    }
    const itemOrder = this.itemOrder.getRawValue();
    itemOrder.orderId = this.order?.id ?? 0;

    this.addData(itemOrder);
    this.itemOrders.push(this.createItemOrder(itemOrder as any));
    this.cleanItemOrder();
  }

  createItemOrder(itemOrder: any): FormGroup {
    return this._formBuilder.group({
      id: [itemOrder.id ?? 0],
      orderId: [itemOrder.orderId ?? 0],
      itemId: [itemOrder.itemId],
      colorId: [
        itemOrder.color?.id ?? itemOrder.colorId,
        [Validators.required],
      ],
      fabricId: [
        itemOrder.fabric?.id ?? itemOrder.fabricId,
        [Validators.required],
      ],
      sizeId: [itemOrder.size?.id ?? itemOrder.sizeId, [Validators.required]],
      amount: [itemOrder.amount, [Validators.required]],
      description: [itemOrder.description],
    });
  }

  addData(itemOrder: any) {
    const dataToAdd = {
      id: itemOrder.id ?? 0,
      item: itemOrder.item,
      color:
        itemOrder.color?.name ??
        this.itemColors.find((color) => color.id == itemOrder.colorId).name,
      fabric:
        itemOrder.fabric?.name ??
        this.itemFabrics.find((fabric) => fabric.id == itemOrder.fabricId).name,
      size:
        itemOrder.size?.name ??
        this.itemSizes.find((size) => size.id == itemOrder.sizeId).name,
      amount: itemOrder.amount,
      price: itemOrder.price,
    };

    this.dataSource.push(dataToAdd);
    this.table?.renderRows();
    this.setOrderTotal();
  }

  removeData(id: number, itemOrder: any) {
    if (itemOrder.id !== 0 && this.requestMethod === 'put') {
      if (this.itemOrders.length === 1) {
        this._toastrService.warning(
          'Não é possível deletar o unico item do pedido.',
          'Não foi possível deletar'
        );
        return;
      }

      this._spinner.isLoading = true;

      this._itemOrderService
        .delete(itemOrder.id)
        .subscribe({
        next: (result: any) => {
          if (result.message === 'Deletado com sucesso') {
                this._toastrService.success(
                  'Item deletado com sucesso',
                  'Item deletado'
                );
              return;
            } else {
              this._toastrService.warning(
                'Revise o pedido',
                'Item não deletado'
                );
              return;
          }
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível deletar o Item',
            'Erro ao deletar'
          );
        },
        })
        .add(() => {
          this._spinner.isLoading = false;
          this.cleanOrder();
          this.loadOrder();
      });
    }

    this.itemOrders.removeAt(id);
    this.dataSource.splice(id, 1);
    this.table?.renderRows();
    this.setOrderTotal();
  }

  loadOrder() {
    const orderId = this._activeRoute.snapshot.paramMap.get('id');
    if (orderId === null) return;

    this._spinner.isLoading = true;
    this.requestMethod = 'put';

    this._orderService
      .getOrderById(+orderId)
      .subscribe({
        next: (data: Order) => {
          this.order = data;

          this.form.patchValue({
            customer: this.order.customer.name,
            customerId: this.order.customer.id,
            executor: this.order.executor.name,
            executorId: this.order.executor.id,
            salePlatform: this.order.salePlatform?.name,
            salePlatformId: this.order.salePlatform?.id,
            orderedAt: this.order.orderedAt,
            deadline: this.order.deadline,
            description: this.order.description,
            total: this.order.total,
          });

          for (let i = 0; i < this.order.itemOrders.length; i++) {
            this.itemOrders.push(
              this.createItemOrder(this.order.itemOrders[i])
            );

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
      })
      .add(() => (this._spinner.isLoading = false));
  }

  saveOrder() {
    if (this.validate() == false) return;

    this._spinner.isLoading = true;

    const { customer, executor, ...formValues } =
      this.form.getRawValue() as any;

    this.order = {
      id: this.order?.id ?? 0,
      createdAt:
        this.requestMethod === 'post' ? new Date() : this.order.createdAt,
      ...formValues,
    };

    this._orderService[this.requestMethod](this.order)
      .subscribe({
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
      })
      .add(() => (this._spinner.isLoading = false));
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
      error: () => this._toastrService.error('Erro ao deletar o pedido'),
    });
  }

  validate(): boolean {
    if (!this.form.valid) {
      this._toastrService.warning(
        'Verifique os campos obrigatórios',
        'Campos inválidos'
      );
      return false;
    }

    console.log(this.form.get('customerId'));

    if (this.form.get('customerId').value == null) {
      this._toastrService.warning(
        'Selecione um cliente da lista disponível',
        'Cliente inválido'
      );
      return false;
    }

    if (this.form.get('executorId').value == null) {
      this._toastrService.warning(
        'Selecione uma produção da lista disponível',
        'Produção inválida'
      );
      return false;
    }

    if (this.itemOrders.length === 0) {
      this._toastrService.warning(
        'Não é possível salvar um pedido sem itens',
        'Pedido inválido'
      );
      return false;
    }

    return true;
  }

  getItems() {
    this._itemService.getItems().subscribe({
      next: (data: Item[]) => {
        this.items = data;
        this.filteredItems = this.itemOrder.get('item').valueChanges.pipe(
          startWith(''),
          map((value) => this._filter(value || '', 'items'))
        );
      },
      error: () => this._toastrService.error('Erro ao carregar os modelos'),
    });
  }

  getSalePlatforms() {
    this._salePlatformService.getSalePlatforms().subscribe({
      next: (data: SalePlatform[]) => {
        this.salePlatforms = data;
      },
      error: () =>
        this._toastrService.error('Erro ao carregar as plataformas de venda'),
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
          return data.result;
        })
      );
  }

  async getItemAttributes(event, itemId: number) {
    if (event.isUserInput === false) return;
    const itemResponse = (await this._itemService.getItemAttributes(
      itemId
    )) as Item;

    const itemOrder = this.itemOrder as FormGroup;
    let colors: Color[] = [];
    let fabrics: Fabric[] = [];
    let sizes: Size[] = [];

    itemOrder.get('itemId')?.setValue(itemId);
    itemOrder.get('price')?.setValue(itemResponse.price);

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
        content: 'Tem certeza que deseja excluir o item do pedido?',
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
        content: 'Tem certeza que deseja excluir o pedido?',
        action: () => {
          this.deleteOrder();
        },
      },
    });
  }

  setOrderTotal() {
    let total = 0;
    this.dataSource.forEach((itemOrder) => {
      const price = itemOrder.amount * itemOrder.price;
      total += price;
    });
    this.form.get('total').setValue(total);
  }

  cleanItemOrder() {
    this.itemOrder.reset();
    this.disableAttributes();
    this.itemOrder.get('item').enable();
    this.updateItemOrder = false;
  }

  cleanOrder() {
    this.cleanItemOrder();
    this.form.reset();
    this.itemOrders.clear();
    this.dataSource = [];
    this.table?.renderRows();
  }

  enableAttributes() {
    this.itemOrder.get('colorId').enable();
    this.itemOrder.get('fabricId').enable();
    this.itemOrder.get('sizeId').enable();
    this.itemOrder.get('amount').enable();
    this.itemOrder.get('description').enable();
  }

  disableAttributes() {
    this.itemOrder.get('colorId').disable();
    this.itemOrder.get('fabricId').disable();
    this.itemOrder.get('sizeId').disable();
    this.itemOrder.get('amount').disable();
    this.itemOrder.get('description').disable();
  }
}
