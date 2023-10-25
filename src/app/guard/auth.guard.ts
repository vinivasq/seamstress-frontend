import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';
import { UserService } from '../services/user.service';

export const authGuard: CanActivateFn = async () => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const userService = inject(UserService);
  const user = JSON.parse(localStorage.getItem('user'));

  if (user === null) {
    toastr.info('Usuário não autenticado.');
    router.navigate(['/user/login']);
    return false;
  }

  if (!(await userService.validateToken(user.token))) {
    userService.logout();
    toastr.info('Usuário não autenticado.');
    router.navigate(['/user/login']);
    return false;
  }

  return true;
};
