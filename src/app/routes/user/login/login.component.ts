import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';
import { User } from 'src/app/models/identity/User';
import { UserLogin } from 'src/app/models/identity/UserLogin';
import { UserService } from 'src/app/services/user.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
})
export class LoginComponent implements OnInit {
  model = {} as UserLogin;

  constructor(
    private _userService: UserService,
    private _router: Router,
    private _toastr: ToastrService
  ) {}

  ngOnInit() {}

  public login(): void {
    this._userService.login(this.model).subscribe({
      next: () => {
        this._userService.currentUser$
          .subscribe((data: User) => {
            if (data.role.toLowerCase() === 'admin') {
              this._router.navigateByUrl('/dashboard/admin');
            } else {
              this._router.navigateByUrl('/dashboard/orders');
            }
          })
          .unsubscribe();
      },
      error: (err: any) => {
        if (err.status === 401)
          this._toastr.error(
            'Usuário ou senha inválidos',
            'Informações inválidas'
          );
        else {
          this._toastr.error('Usuário não encontrado');
        }
      },
    });
  }
}
