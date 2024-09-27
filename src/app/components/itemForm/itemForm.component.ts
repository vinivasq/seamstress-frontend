import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { HttpErrorResponse, HttpResponse } from '@angular/common/http';
import { Router, RouterModule } from '@angular/router';
import {
  FormsModule,
  ReactiveFormsModule,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { map, Observable, startWith } from 'rxjs';

import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatOptionSelectionChange } from '@angular/material/core';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatDialog } from '@angular/material/dialog';

import { NgxDropzoneChangeEvent, NgxDropzoneModule } from 'ngx-dropzone';

import { DialogComponent } from '../dialog/dialog.component';

import { Item } from 'src/app/models/Item';
import { Set } from 'src/app/models/Set';
import { Color } from 'src/app/models/Color';
import { Fabric } from 'src/app/models/Fabric';
import { Size } from 'src/app/models/Size';
import { ItemSizes } from 'src/app/models/ItemSizes';
import { ItemColors } from 'src/app/models/ItemColors';
import { ItemFabrics } from 'src/app/models/ItemFabrics';

import { SetService } from 'src/app/services/set.service';
import { ColorService } from 'src/app/services/color.service';
import { FabricService } from 'src/app/services/fabric.service';
import { SizeService } from 'src/app/services/size.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from 'src/app/services/spinner.service';
import { ItemService } from 'src/app/services/item.service';
import { ImageService } from 'src/app/services/image.service';
import { HttpMethod } from 'src/utils/constants';

@Component({
  selector: 'app-itemForm',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    FormsModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatFormFieldModule,
    MatAutocompleteModule,
    MatInputModule,
    MatSelectModule,
    MatIconModule,
    NgxDropzoneModule,
  ],
  templateUrl: './itemForm.component.html',
  styleUrls: ['./itemForm.component.scss'],
})
export class ItemFormComponent implements OnInit {
  @Input() itemId?: number;

  requestMethod: HttpMethod = 'POST';
  isMobile = window.screen.width < 992;
  hasFKs: boolean = false;

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
  images: File[] = [];
  colors: Color[];
  fabrics: Fabric[];
  sizes: Size[];
  sets: Set[];
  filteredSets: Observable<Set[]>;
  setId?: number;

  constructor(
    private _formBuilder: FormBuilder,
    private _itemService: ItemService,
    private _imageService: ImageService,
    private _setService: SetService,
    private _colorService: ColorService,
    private _fabricService: FabricService,
    private _sizeService: SizeService,
    private _router: Router,
    private _toastrService: ToastrService,
    private _spinner: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.loadAttributes();

    if (this.itemId) this.loadItem();
  }

  loadAttributes() {
    this._colorService.getColors().subscribe((colors: Color[]) => {
      this.colors = colors;
    });
    this._fabricService
      .getFabrics()
      .subscribe((fabrics: Fabric[]) => (this.fabrics = fabrics));
    this._sizeService
      .getSizes()
      .subscribe((sizes: Size[]) => (this.sizes = sizes));
    this._setService.getSets().subscribe((sets: Set[]) => {
      this.sets = sets;
      this.filteredSets = this.form.get('set').valueChanges.pipe(
        startWith(''),
        map((value) => this._setService.filterSets(value || '', this.sets))
      );
    });
  }

  loadItem() {
    this._spinner.isLoading = true;

    this._itemService
      .getItemById(this.itemId)
      .subscribe({
        next: async (data: Item) => {
          this.requestMethod = 'PUT';

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

          this._itemService.checkFK(this.item.id).subscribe({
            next: (data: boolean) => {
              this.hasFKs = data;
            },
            error: (error: HttpErrorResponse) =>
              this._toastrService.error(
                error.error,
                'Erro ao checar por relacionamentos'
              ),
          });
        },
        error: () => {
          this._toastrService.error(
            'Não foi possível carregar o modelo',
            'Erro ao carregar'
          );
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  async saveItem() {
    if (!this.form.valid) {
      this._toastrService.warning('Campos inválidos');
      return;
    }

    this._spinner.isLoading = true;

    const { name, price } = this.form.getRawValue();
    const itemAttributes = {
      set: this.form.getRawValue().set as unknown as string,
      itemColors: this.form.getRawValue().itemColors as unknown as number[],
      itemFabrics: this.form.getRawValue().itemFabrics as unknown as number[],
      itemSizes: this.form.getRawValue().itemSizes as unknown as number[],
    };
    const itemSizes = this.item?.itemSizes;

    this.item = {
      id: this.item?.id ?? 0,
      name: name,
      setId: this.setId,
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

    this._itemService[this.requestMethod.toLowerCase()](this.item)
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
        error: (e: HttpErrorResponse) => {
          console.log(e);

          this._toastrService.error(
            'Não foi possível salvar o modelo',
            'Erro ao salvar'
          );
        },
      })
      .add(() => (this._spinner.isLoading = false));
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

  updateSet(event: MatOptionSelectionChange<string>, setId: number) {
    if (event.isUserInput) this.setId = setId;
  }

  // Dialog functions
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

  // Dropzone functions
  onSelect(event: NgxDropzoneChangeEvent) {
    this.images.push(...event.addedFiles);
    this.form.controls['imageURL'].setErrors(null);
  }

  onRemove(image: File) {
    const imageURL = this.form.controls.imageURL as FormControl;
    this.images.splice(this.images.indexOf(image), 1);
    imageURL.markAsTouched();

    if (this.images.length === 0) {
      imageURL.setErrors({ required: true });
    }
  }
}
