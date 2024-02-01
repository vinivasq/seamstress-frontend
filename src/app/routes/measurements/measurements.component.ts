import { Component, OnInit } from '@angular/core';
import {
  FormArray,
  FormBuilder,
  FormControl,
  Validators,
} from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { Item } from 'src/app/models/Item';
import { ItemSizes } from 'src/app/models/ItemSizes';
import { ItemService } from 'src/app/services/item.service';
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
    itemId: [0],
    size: ['', Validators.required],
    measurements: new FormArray([this.createMeasurement()]),
  });

  get measurementsArray(): FormArray {
    return this.form.controls['measurements'] as FormArray;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private _activeRoute: ActivatedRoute,
    private _itemService: ItemService,
    private _toastrService: ToastrService,
    private _router: Router,
    private _spinner: SpinnerService
  ) {}

  ngOnInit() {
    this.itemId = +this._activeRoute.snapshot.paramMap.get('id');
    this.getItem(this.itemId);
  }

  getItem(id: number) {
    this._spinner.isLoading = true;
    this._itemService
      .getItemById(id)
      .subscribe({
        next: (data: Item) => {
          this.item = data;
          this.itemSizes = this.item.itemSizes.sort(
            (a, b) => a.size.id - b.size.id
          );

          const itemId = this.form.get('itemId') as FormControl;
          const size = this.form.get('size') as FormControl;
          itemId.patchValue(this.item.id);
          size.patchValue(this.itemSizes[0].id);
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
    if (index >= 0 && index < measurements.length) {
      measurements.removeAt(index);
    }
  }

  saveMeasurement() {
    if (this.form.invalid) {
      this._toastrService.warning('Campos inválidos');
      return;
    }

    console.log(this.form.getRawValue());
  }
}
