import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { authGuard } from './guard/auth.guard';

import { NotFoundComponent } from './routes/notFound/notFound.component';
import { DashboardComponent } from './routes/dashboard/dashboard.component';
import { OrdersComponent } from './routes/dashboard/orders/orders.component';
import { OrderComponent } from './routes/order/order.component';
import { UserComponent } from './routes/user/user.component';
import { LoginComponent } from './routes/user/login/login.component';
import { RegisterComponent } from './routes/user/register/register.component';
import { ProfileComponent } from './routes/user/profile/profile.component';
import { ItemComponent } from './routes/item/item.component';
import { ItemsComponent } from './routes/dashboard/items/items.component';
import { CustomersComponent } from './routes/dashboard/customers/customers.component';
import { CustomerComponent } from './routes/customer/customer.component';
import { ColorComponent } from './routes/attributes/color/color.component';
import { FabricComponent } from './routes/attributes/fabric/fabric.component';
import { SizeComponent } from './routes/attributes/size/size.component';
import { SetComponent } from './routes/attributes/set/set.component';
import { AttributesComponent } from './routes/attributes/attributes.component';

const routes: Routes = [
  { path: '', redirectTo: 'dashboard/orders', pathMatch: 'full' },
  { path: 'dashboard', redirectTo: 'dashboard/orders', pathMatch: 'full' },

  { path: 'user', redirectTo: 'user/profile', pathMatch: 'full' },
  {
    path: 'user',
    component: UserComponent,
    children: [
      { path: 'login', component: LoginComponent },
      { path: 'register', component: RegisterComponent },
      {
        path: 'profile',
        component: ProfileComponent,
        canActivate: [authGuard],
      },
    ],
  },

  {
    path: '',
    runGuardsAndResolvers: 'always',
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        component: DashboardComponent,
        children: [
          { path: 'orders', component: OrdersComponent },
          { path: 'customers', component: CustomersComponent },
          { path: 'items', component: ItemsComponent },
        ],
      },

      {
        path: 'customers',
        redirectTo: 'dashboard/customers',
        pathMatch: 'full',
      },
      { path: 'customer', component: CustomerComponent },
      { path: 'customer/:id', component: CustomerComponent },

      { path: 'orders', redirectTo: 'dashboard/orders', pathMatch: 'full' },
      { path: 'order', component: OrderComponent },
      { path: 'order/:id', component: OrderComponent },

      { path: 'items', redirectTo: 'dashboard/items', pathMatch: 'full' },
      { path: 'item', component: ItemComponent },
      { path: 'item/:id', component: ItemComponent },

      { path: 'attributes', redirectTo: 'attributes/color', pathMatch: 'full' },
      {
        path: 'attributes',
        component: AttributesComponent,
        children: [
          { path: 'color', component: ColorComponent },
          { path: 'fabric', component: FabricComponent },
          { path: 'size', component: SizeComponent },
          { path: 'set', component: SetComponent },
        ],
      },
    ],
  },

  { path: '**', component: NotFoundComponent },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class AppRoutingModule {}
