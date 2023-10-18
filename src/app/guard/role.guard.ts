import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { ToastrService } from 'ngx-toastr';

export const roleGuard: CanActivateFn = (route, state) => {
  const router = inject(Router);
  const toastr = inject(ToastrService);
  const user = JSON.parse(localStorage.getItem('user'));
  const isAllowed = route.data['role']?.includes(user.role.toLowerCase());

  if (!isAllowed) {
    toastr.info('Acesso não permitido.');
    router.navigate(['dashboard/orders']);
    return false;
  }
  return true;
};
