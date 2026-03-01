import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { ToastrService } from 'ngx-toastr';
import { DialogEditUserComponent } from 'src/app/components/dialogEditUser/dialogEditUser.component';
import { UserOutput } from 'src/app/models/identity/UserOutput';
import { SpinnerService } from 'src/app/services/spinner.service';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-users',
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss'],
})
export class UsersComponent implements OnInit {
  users: UserOutput[] = [];

  constructor(
    private _userService: UserService,
    private _toastr: ToastrService,
    private _spinner: SpinnerService,
    private _dialog: MatDialog
  ) {}

  ngOnInit(): void {
    this.getUsers();
  }

  getUsers(): void {
    this._spinner.isLoading = true;

    this._userService
      .getUsers()
      .subscribe({
        next: (data) => {
          this.users = data;
        },
        error: (error) => {
          console.log(error);
          this._toastr.error('Não foi possível listar os usuários', 'Erro de conexão');
        },
      })
      .add(() => (this._spinner.isLoading = false));
  }

  openEditDialog(user: UserOutput): void {
    const dialogRef = this._dialog.open(DialogEditUserComponent, {
      width: '420px',
      data: user,
    });

    dialogRef.afterClosed().subscribe((updatedUser: UserOutput | undefined) => {
      if (updatedUser) {
        const index = this.users.findIndex((u) => u.id === updatedUser.id);
        if (index !== -1) {
          this.users[index] = updatedUser;
        }
      }
    });
  }
}
