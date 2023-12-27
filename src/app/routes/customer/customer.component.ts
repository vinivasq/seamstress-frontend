import { StepperOrientation } from '@angular/cdk/stepper';
import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormControl, Validators } from '@angular/forms';
import { Observable, map } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { MatStepperIntl } from '@angular/material/stepper';
import { ActivatedRoute, Router } from '@angular/router';
import { CustomerService } from 'src/app/services/customer.service';
import { Customer } from 'src/app/models/Customer';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from 'src/app/services/spinner.service';
import { HttpErrorResponse } from '@angular/common/http';

@Component({
  selector: 'app-customer',
  templateUrl: './customer.component.html',
  styleUrls: ['./customer.component.scss'],
})
export class CustomerComponent implements OnInit {
  requestMethod = 'post';
  customer = {} as Customer;
  stepperOrientation: Observable<StepperOrientation>;

  get firstGroup(): any {
    return this.form.get('firstFormGroup') as FormControl;
  }
  get secondGroup(): any {
    return this.form.get('secondFormGroup') as FormControl;
  }
  get thirdGroup(): any {
    return this.form.get('thirdFormGroup') as FormControl;
  }

  form = this._formBuilder.group({
    firstFormGroup: this._formBuilder.group({
      email: ['', [Validators.required, Validators.email]],
      name: ['', [Validators.required]],
      cpF_CNPJ: ['', [Validators.required]],
      phoneNumber: ['', [Validators.required]],
    }),
    secondFormGroup: this._formBuilder.group({
      cep: ['', [Validators.required]],
      address: ['', [Validators.required]],
      city: ['', [Validators.required]],
      neighborhood: ['', [Validators.required]],
      number: [null, [Validators.required]],
      complement: [''],
    }),
    thirdFormGroup: this._formBuilder.group({
      id: [0],
      bust: [null],
      waist: [null],
      hip: [null],
      shoulderToShoulder: [null],
      arm: [null],
      thigh: [null],
      calf: [null],
      lengthLegging: [null],
      lengthPants: [null],
      lengthDress: [null],
      lengthShirt: [null],
      lengthTunica: [null],
    }),
  });

  constructor(
    private _formBuilder: FormBuilder,
    private _breakpointObserver: BreakpointObserver,
    private _matStepperIntl: MatStepperIntl,
    private _activeRoute: ActivatedRoute,
    private _router: Router,
    private _customerService: CustomerService,
    private _toastr: ToastrService,
    private _spinnerService: SpinnerService
  ) {
    this.stepperOrientation = this._breakpointObserver
      .observe('(min-width: 768px)')
      .pipe(map(({ matches }) => (matches ? 'horizontal' : 'vertical')));
  }

  ngOnInit() {
    this._matStepperIntl.optionalLabel = 'Opcional';

    this.loadCustomer();
  }

  loadCustomer(): void {
    const customerId = this._activeRoute.snapshot.paramMap.get('id');
    if (customerId === null) return;

    this.requestMethod = 'patch';
    this._spinnerService.isLoading = true;
    this._customerService.getCustomerByID(+customerId).subscribe({
      next: (customer: Customer) => {
        this.customer = { ...customer };

        const firstFormGroup = this.form.get('firstFormGroup') as FormControl;
        firstFormGroup.patchValue(this.customer);

        const secondFormGroup = this.form.get('secondFormGroup') as FormControl;
        secondFormGroup.patchValue(this.customer);

        const thirdFormGroup = this.form.get('thirdFormGroup') as FormControl;
        thirdFormGroup.patchValue(this.customer.sizings);
      },
      error: (error) => {
        console.log(error);
        this._toastr.error(
          'Não foi possível carregar o cliente',
          'Erro ao carregar'
        );
        this._spinnerService.isLoading = false;
      },
      complete: () => (this._spinnerService.isLoading = false),
    });
  }

  saveCustomer(): void {
    if (!this.form.valid) {
      this._toastr.warning('Campos inválidos');
      return;
    }

    let sizings = Object.values(this.form.getRawValue().thirdFormGroup).map(
      (value) => value
    );
    sizings[0] = null;

    const formValues = {
      ...this.form.getRawValue().firstFormGroup,
      ...this.form.getRawValue().secondFormGroup,
      sizings: sizings.some((sizing) => sizing != null)
        ? { ...this.form.getRawValue().thirdFormGroup }
        : null,
    } as any;

    this.requestMethod === 'post'
      ? (this.customer = { ...formValues })
      : (this.customer = { id: this.customer.id, ...formValues });

    this._customerService[this.requestMethod](this.customer).subscribe({
      next: () => {
        this._toastr.success('Cliente salvo com sucesso', 'Salvo com sucesso');

        this._router.navigate(['/dashboard/customers']);
      },
      error: (error: HttpErrorResponse) => {
        this._toastr.error(error.error, 'Erro ao salvar');
      },
      complete: () => {},
    });
  }

  getAddress() {
    const cep = this.secondGroup.get('cep');
    if (cep.invalid) return;

    this._customerService.getAddress(+cep.getRawValue()).subscribe({
      next: (data: any) => {
        this.secondGroup.get('address').patchValue(data.logradouro);
        this.secondGroup.get('city').patchValue(data.localidade);
        this.secondGroup.get('neighborhood').patchValue(data.bairro);
      },
      error: (error) => {
        console.log(error);
        this._toastr.error(
          'Não foi possível encontrar o endereço',
          'Erro ao buscar endereço'
        );
      },
    });
  }
}
