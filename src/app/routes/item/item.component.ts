import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Color } from 'src/app/models/Color';
import { Fabric } from 'src/app/models/Fabric';
import { Size } from 'src/app/models/Size';
import { Set } from 'src/app/models/Set';
import { AttributeService } from 'src/app/services/attribute.service';
import { ToastrService } from 'ngx-toastr';
import { Observable, map, startWith } from 'rxjs';
import { Item } from 'src/app/models/Item';
import { ItemService } from 'src/app/services/item.service';
import { ActivatedRoute, Router } from '@angular/router';
import { DialogComponent } from 'src/app/components/dialog/dialog.component';
import { MatDialog } from '@angular/material/dialog';
import { ItemColors } from 'src/app/models/ItemColors';
import { ItemFabrics } from 'src/app/models/ItemFabrics';
import { ItemSizes } from 'src/app/models/ItemSizes';
import { ImageService } from 'src/app/services/image.service';
import { SpinnerService } from 'src/app/services/spinner.service';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';

@Component({
  selector: 'app-item',
  templateUrl: './item.component.html',
  styleUrls: ['./item.component.scss'],
})
export class ItemComponent implements OnInit {
  isMobile: boolean;
  requestMethod = 'post';
  hasFks: boolean;
  itemId = 0;

  form = this._formBuilder.group({
    name: ['', Validators.required],
    set: [''],
    itemColors: ['', Validators.required],
    itemFabrics: ['', Validators.required],
    itemSizes: ['', Validators.required],
    imageURL: ['', Validators.required],
    price: ['', Validators.required],
  });

  item: Item;
  colors: Color[];
  fabrics: Fabric[];
  sizes: Size[];
  images: File[] = [];
  sets: Set[];
  set: Set;
  filteredSets: Observable<Set[]>;

  constructor(
    private _formBuilder: FormBuilder,
    private _attributeService: AttributeService,
    private _itemService: ItemService,
    private _imageService: ImageService,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _toastrService: ToastrService,
    private _spinner: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit() {
    this.getSets();
    this.getColors();
    this.getFabrics();
    this.getSizes();
    this.loadItem();

    window.screen.width < 992
      ? (this.isMobile = true)
      : (this.isMobile = false);
  }

  private _filterSets(value: string): Set[] {
    const filterValue = value.toLowerCase();

    return this.sets.filter((set) =>
      set.name.toLowerCase().includes(filterValue)
    );
  }

  getSetId(event, set: Set) {
    if (event.isUserInput) this.set = set;
  }

  loadItem() {
    this.itemId = +this._activeRoute.snapshot.paramMap.get('id');
    if (this.itemId === 0) return;

    this._spinner.isLoading = true;
    this.requestMethod = 'put';

    this._itemService.getItemById(this.itemId).subscribe({
      next: async (data: Item) => {
        this.item = { ...data };

        if (this.item.imageURL?.length > 0) {
          const images = this.item.imageURL.split(';');

          images.forEach(async (image) => {
            const response = await this._imageService.getImage(image);
            const imageFile = new File([response], image);

            this.images.push(imageFile);
          });
        }

        const name = this.form.get('name') as FormControl;
        name.patchValue(this.item.name);

        const set = this.form.get('set') as FormControl;
        set.patchValue(this.item.set?.name);

        const imageURL = this.form.get('imageURL') as FormControl;
        imageURL.patchValue(this.item.imageURL);

        const price = this.form.get('price') as FormControl;
        price.patchValue(this.item.price);

        const itemColors = this.form.get('itemColors') as FormControl;
        itemColors.patchValue(
          this.item.itemColors.map((color: ItemColors) => color.colorId)
        );

        const itemFabrics = this.form.get('itemFabrics') as FormControl;
        itemFabrics.patchValue(
          this.item.itemFabrics.map((fabric: ItemFabrics) => fabric.fabricId)
        );

        const itemSizes = this.form.get('itemSizes') as FormControl;
        itemSizes.patchValue(
          this.item.itemSizes.map((size: ItemSizes) => size.sizeId)
        );
      },
      error: () => {
        this._toastrService.error(
          'Não foi possível carregar o modelo',
          'Erro ao carregar'
        );
      },
    });

    this._itemService
      .checkFK(this.itemId)
      .subscribe({
        next: (data: boolean) => {
          this.hasFks = data;
        },
        error: (error: HttpErrorResponse) =>
          this._toastrService.error(
            error.error,
            'Erro ao checar por relacionamentos'
          ),
      })
      .add(() => (this._spinner.isLoading = false));
  }

  async saveItem() {
    if (!this.form.valid) {
      this._toastrService.warning('Campos inválidos');
      return;
    }

    this._spinner.isLoading = true;

    let setId: number;
    const { name, price } = this.form.getRawValue();
    const itemAttributes = {
      set: this.form.getRawValue().set as unknown as string,
      itemColors: this.form.getRawValue().itemColors as unknown as number[],
      itemFabrics: this.form.getRawValue().itemFabrics as unknown as number[],
      itemSizes: this.form.getRawValue().itemSizes as unknown as number[],
    };
    const itemSizes = this.item?.itemSizes;

    if (itemAttributes.set?.length === 0) {
      setId = null;
    } else {
      setId = this.set?.id ?? this.item?.set?.id;
    }

    this.item = {
      id: this.item?.id ?? 0,
      name: name,
      setId: setId,
      itemColors: [],
      itemFabrics: [],
      itemSizes: [],
      imageURL: null,
      price: price as unknown as number,
      isActive: this.item?.isActive,
    };

    if (this.images?.length > 0) {
      try {
        this.item.imageURL = await this._itemService.updateImage(
          this.item.id,
          this.images
        );
      } catch (error) {
        this._spinner.isLoading = false;
        this._toastrService.error('Erro ao salvar imagens');
        return;
      }
    }

    itemAttributes.itemColors.forEach((ic) => {
      this.item.itemColors.push({ itemId: this.item.id, colorId: ic });
    });
    itemAttributes.itemFabrics.forEach((ifabric) => {
      this.item.itemFabrics.push({
        itemId: this.item.id,
        fabricId: ifabric,
      });
    });
    itemAttributes.itemSizes.forEach((is) => {
      let itemSizeId = itemSizes?.find(
        (itemSize) => itemSize.sizeId === is
      )?.id;

      if (itemSizeId) {
        this.item.itemSizes.push({
          id: itemSizeId,
          itemId: this.item.id,
          sizeId: is,
        });
      } else {
        this.item.itemSizes.push({
          id: 0,
          itemId: this.item.id,
          sizeId: is,
        });
      }
    });

    this._spinner.isLoading = false;

    this._itemService[this.requestMethod](this.item)
      .subscribe({
        next: () => {
          this._toastrService.success(
            'Modelo salvo com sucesso',
            'Salvo com sucesso'
          );

          this.form.reset();
          this.images = null;
          this._router.navigate(['/item']);
        },
        error: () => {
          console.log('erro');

          this._toastrService.error(
            'Não foi possível salvar o modelo',
            'Erro ao salvar'
          );
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  onSelect(event) {
    this.images.push(...event.addedFiles);
    this.form.controls['imageURL'].setErrors(null);
  }

  onRemove(event) {
    const imageURL = this.form.controls.imageURL as FormControl;
    this.images.splice(this.images.indexOf(event), 1);
    imageURL.markAsTouched();

    if (this.images.length === 0) {
      imageURL.setErrors({ required: true });
    }
  }

  public deleteDialog() {
    this._dialog.open(DialogComponent, {
      data: {
        title: `Deseja excluir o modelo ${this.item.name}?`,
        content: 'Tem certeza que deseja excluir o modelo?',
        action: () => this.deleteItem(this.item.id),
      },
    });
  }

  public inactiveDialog() {
    this._dialog.open(DialogComponent, {
      data: {
        title: `Deseja inativar o modelo ${this.item.name}?`,
        content: `Existem itens de pedidos com este modelo, sua exclusão não será possível.
            Deseja inativar?`,
        action: () => this.setActiveState(this.item.id, false),
      },
    });
  }

  setActiveState(id: number, state: boolean) {
    this._itemService.setActiveState(id, state).subscribe({
      next: (data: HttpResponse<Item>) => {
        if (data.status === 200) {
          if (data.body.isActive === state) {
            if (state === false) {
              this._toastrService.success('Modelo inativado');
              this._router.navigate(['/dashboard/items']);
            } else {
              this._toastrService.success('Modelo habilitado');
              this.loadItem();
            }
          } else {
            this._toastrService.warning('O modelo não foi alterado');
          }
        } else {
          this._toastrService.warning('Houve um erro ao alterar o modelo');
        }
      },
      error: (error: HttpErrorResponse) =>
        this._toastrService.error(error.error, 'Erro ao alterar o modelo'),
    });
  }

  deleteItem(id: number) {
    this._spinner.isLoading = true;
    this._itemService
      .delete(id)
      .subscribe({
        next: (result: any) => {
          if (result.message === 'Deletado com sucesso') {
            this._toastrService.success(
              'Modelo deletado com sucesso',
              'Modelo deletado'
            );
            this._router.navigate(['/dashboard/items']);
          }
        },
        error: (error) => {
          console.log(error);
          this._toastrService.error(
            'Erro ao deletar',
            'Ocorreu um erro ao deletar o modelo'
          );
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  getSets() {
    this._attributeService.setAttribute('set');

    this._attributeService.getAttributes().subscribe({
      next: (data: Set[]) => {
        this.sets = data;
        this.filteredSets = this.form.get('set').valueChanges.pipe(
          startWith(''),
          map((value) => this._filterSets(value || ''))
        );
      },
      error: () =>
        this._toastrService.error(
          'Erro ao buscar os conjuntos',
          'Erro ao listar'
        ),
    });
  }

  getColors() {
    this._attributeService.setAttribute('color');

    this._attributeService.getAttributes().subscribe({
      next: (data: Color[]) => {
        this.colors = data;
      },
      error: () =>
        this._toastrService.error('Erro ao buscar as cores', 'Erro ao listar'),
    });
  }

  getFabrics() {
    this._attributeService.setAttribute('fabric');

    this._attributeService.getAttributes().subscribe({
      next: (data: Fabric[]) => {
        this.fabrics = data;
      },
      error: () =>
        this._toastrService.error(
          'Erro ao buscar os tecidos',
          'Erro ao listar'
        ),
    });
  }

  getSizes() {
    this._attributeService.setAttribute('size');

    this._attributeService.getAttributes().subscribe({
      next: (data: Size[]) => {
        this.sizes = data;
      },
      error: () =>
        this._toastrService.error(
          'Erro ao buscar os tamanhos',
          'Erro ao listar'
        ),
    });
  }
}
