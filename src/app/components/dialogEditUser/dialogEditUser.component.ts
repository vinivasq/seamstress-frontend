import { Component, Inject } from '@angular/core';
import { FormBuilder, Validators } from '@angular/forms';
import { MAT_DIALOG_DATA, MatDialogRef } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { UserOutput } from 'src/app/models/identity/UserOutput';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-dialog-edit-user',
  templateUrl: './dialogEditUser.component.html',
  styleUrls: ['./dialogEditUser.component.scss'],
})
export class DialogEditUserComponent {
  roles = ['Admin', 'Requester', 'Executor'];

  usernameForm = this._formBuilder.group({
    userName: [this.data.userName, Validators.required],
  });

  passwordForm = this._formBuilder.group({
    password: ['', [Validators.required, Validators.minLength(6)]],
  });

  roleForm = this._formBuilder.group({
    role: [this.data.role, Validators.required],
  });

  get usernameControls(): any {
    return this.usernameForm.controls;
  }

  get passwordControls(): any {
    return this.passwordForm.controls;
  }

  get roleControls(): any {
    return this.roleForm.controls;
  }

  constructor(
    private _formBuilder: FormBuilder,
    private _userService: UserService,
    private _toastr: ToastrService,
    private _spinner: SpinnerService,
    private _dialogRef: MatDialogRef<DialogEditUserComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserOutput
  ) {}

  saveUsername(): void {
    this._spinner.isLoading = true;

    const userName = this.usernameForm.getRawValue().userName!;

    this._userService
      .adminUpdateUser(this.data.id, { userName })
      .subscribe({
        next: (updatedUser) => {
          this._toastr.success('Nome de usuário atualizado', 'Sucesso');
          this._dialogRef.close(updatedUser);
        },
        error: (error) => {
          console.log(error);
          this._toastr.error('Não foi possível atualizar o nome de usuário', 'Erro');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  savePassword(): void {
    this._spinner.isLoading = true;

    const password = this.passwordForm.getRawValue().password!;

    this._userService
      .adminUpdateUser(this.data.id, { userName: this.data.userName, password })
      .subscribe({
        next: () => {
          this._toastr.success('Senha redefinida com sucesso', 'Sucesso');
          this.passwordForm.reset();
        },
        error: (error) => {
          console.log(error);
          this._toastr.error('Não foi possível redefinir a senha', 'Erro');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  saveRole(): void {
    this._spinner.isLoading = true;

    const role = this.roleForm.getRawValue().role!;

    this._userService
      .adminUpdateUser(this.data.id, { userName: this.data.userName, role })
      .subscribe({
        next: (updatedUser) => {
          this._toastr.success('Função atualizada com sucesso', 'Sucesso');
          this._dialogRef.close(updatedUser);
        },
        error: (error) => {
          console.log(error);
          this._toastr.error('Não foi possível atualizar a função', 'Erro');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }
}
