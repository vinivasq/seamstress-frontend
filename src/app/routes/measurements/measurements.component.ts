import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { MatSelectChange } from '@angular/material/select';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Item } from 'src/app/models/Item';
import { ItemSizes } from 'src/app/models/ItemSizes';
import { ItemService } from 'src/app/services/item.service';
import { ItemSizeService } from 'src/app/services/itemSize.service';
import { SpinnerService } from 'src/app/services/spinner.service';

@Component({
  selector: 'app-measurements',
  templateUrl: './measurements.component.html',
  styleUrls: ['./measurements.component.scss'],
})
export class MeasurementsComponent implements OnInit {
  itemId: number;
  item: Item;
  itemSizes: ItemSizes[];
  itemSize: ItemSizes;

  form = this._formBuilder.group({
    id: [0],
    itemId: [0],
    sizeId: ['', Validators.required],
    measurements: new FormArray([]),
  });

  get measurementsArray(): FormArray {
    return this.form.controls['measurements'] as FormArray;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _itemSizeService: ItemSizeService,
    private _toastrService: ToastrService,
    private _router: Router,
    private _spinner: SpinnerService
  ) {}

  ngOnInit() {
    this.itemId = +this._activeRoute.snapshot.paramMap.get('id');
    this.getItemSizes(this.itemId);
  }

  getItemSizes(id: number) {
    this._spinner.isLoading = true;
    this._itemSizeService
      .getItemSizes(id)
      .subscribe({
        next: (data: ItemSizes[]) => {
          this.itemSizes = data.filter((itemSize) => itemSize.sizeId !== 1);
          this.itemSizes = this.itemSizes.sort((a, b) => a.size.id - b.size.id);
          this.itemSize = this.itemSizes[0];
          this.item = this.itemSize.item;

          const id = this.form.get('id') as FormControl;
          const itemId = this.form.get('itemId') as FormControl;
          const sizeId = this.form.get('sizeId') as FormControl;
          const measurements = this.form.get('measurements') as FormArray;

          if (this.itemSize.measurements.length > 0) {
            this.itemSize.measurements.forEach(() => this.addMeasure());
          }

          id.patchValue(this.itemSize.id);
          itemId.patchValue(this.item.id);
          sizeId.patchValue(this.itemSize.sizeId);
          measurements.patchValue(this.itemSize.measurements);
        },
        error: () => {
          this._toastrService.error('Erro ao buscar modelo');
          this._router.navigateByUrl('dashboard/items');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  getItemSize(e: MatSelectChange) {
    if (!(e.value > 0)) {
      this._toastrService.error('Tamanho inválido');
      return;
    }

    const itemSizeId = this.itemSizes.find(
      (itemSize) => itemSize.sizeId == e.value
    ).id;

    this._spinner.isLoading = true;
    this._itemSizeService
      .getItemSizeById(itemSizeId)
      .subscribe({
        next: (data: ItemSizes) => {
          this.itemSize = data;

          const id = this.form.get('id') as FormControl;
          const measurements = this.form.get('measurements') as FormControl;
          const sizeId = this.form.get('sizeId') as FormControl;

          this.clearMeasurementsArray();

          if (this.itemSize.measurements.length > 0) {
            this.itemSize.measurements.forEach(() => this.addMeasure());
          }

          id.patchValue(this.itemSize.id);
          sizeId.patchValue(this.itemSize.sizeId);
          measurements.patchValue(this.itemSize.measurements);
        },
        error: () => {
          this._toastrService.error('Erro ao buscar modelo');
          this._router.navigateByUrl('dashboard/items');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  createMeasurement() {
    return this._formBuilder.group({
      id: 0,
      itemSizeId: 0,
      measure: [null, Validators.required],
      value: [null, Validators.required],
    });
  }

  addMeasure() {
    const measurements = this.form.get('measurements') as FormArray;
    measurements.push(this.createMeasurement());
  }

  removeMeasure(index: number) {
    const measurements = this.form.get('measurements') as FormArray;
    if (index >= 0) {
      measurements.removeAt(index);
    }
  }

  saveMeasurement() {
    if (this.form.invalid) {
      this._toastrService.warning('Campos inválidos');
      return;
    }

    this._spinner.isLoading = true;

    this.itemSize = this.form.getRawValue() as unknown as ItemSizes;
    this.itemSize.measurements.map((measurement) => {
      measurement.itemSizeId = this.itemSize.id;
      measurement.measure = measurement.measure.trim();
    });

    this._itemSizeService
      .updateItemSize(this.itemSize)
      .subscribe({
        next: (data: ItemSizes) => {
          this.itemSize = data;

          console.log(data);

          const id = this.form.get('id') as FormControl;
          const measurements = this.form.get('measurements') as FormControl;
          const sizeId = this.form.get('sizeId') as FormControl;

          id.patchValue(this.itemSize.id);
          sizeId.patchValue(this.itemSize.sizeId);
          measurements.setValue(this.itemSize.measurements);

          this._toastrService.success('Medida Salva');
        },
        error: (error: any) => {
          this._toastrService.error('Erro ao salvar a medida');
          console.log(error);
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  clearMeasurementsArray() {
    while (this.measurementsArray.length !== 0) {
      this.measurementsArray.removeAt(0);
    }
  }
}
