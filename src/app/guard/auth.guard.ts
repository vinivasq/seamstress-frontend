import { CanActivateFn, Router } from '@angular/router';
import { inject } from '@angular/core';
import { ToastrService } from 'ngx-toastr';

export const authGuard: CanActivateFn = () => {
  const router = inject(Router);
  const toastr = inject(ToastrService);

  if (localStorage.getItem('user') !== null) return true;

  toastr.info('Usuário não autenticado.');
  router.navigate(['/user/login']);
  return false;
};
