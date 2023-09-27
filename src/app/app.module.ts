import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { AppRoutingModule } from './app-routing.module';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { HttpClientModule } from '@angular/common/http';

import { NgxMaskDirective, NgxMaskPipe, provideNgxMask } from 'ngx-mask';
import { ToastrModule } from 'ngx-toastr';
import { NgxDropzoneModule } from 'ngx-dropzone';
import { NgxMatNumberInputSpinnerModule } from 'ngx-mat-number-input-spinner';

import { MatButtonModule } from '@angular/material/button';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatTabsModule } from '@angular/material/tabs';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatInputModule } from '@angular/material/input';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule } from '@angular/material/dialog';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatStepperModule } from '@angular/material/stepper';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatMenuModule } from '@angular/material/menu';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSelectModule } from '@angular/material/select';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatRadioModule } from '@angular/material/radio';
import { MAT_DATE_LOCALE, MatNativeDateModule } from '@angular/material/core';

import { AppComponent } from './app.component';
import { DashboardComponent } from './routes/dashboard/dashboard.component';
import { DialogComponent } from './components/dialog/dialog.component';
import { DialogCarouselComponent } from './components/dialogCarousel/dialogCarousel.component';
import { ItemComponent } from './routes/item/item.component';
import { OrderComponent } from './routes/order/order.component';
import { OrdersComponent } from './routes/dashboard/orders/orders.component';
import { ProfileComponent } from './routes/user/profile/profile.component';
import { TitleComponent } from './components/title/title.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { LinksComponent } from './components/links/links.component';
import { ItemsComponent } from './routes/dashboard/items/items.component';
import { ColorComponent } from './routes/attributes/color/color.component';
import { FabricComponent } from './routes/attributes/fabric/fabric.component';
import { SizeComponent } from './routes/attributes/size/size.component';
import { SetComponent } from './routes/attributes/set/set.component';
import { AttributesComponent } from './routes/attributes/attributes.component';
import { AttributesNavigationComponent } from './components/attributesNavigation/attributesNavigation.component';
import { CustomersComponent } from './routes/dashboard/customers/customers.component';
import { CustomerComponent } from './routes/customer/customer.component';
import { ButtonAddComponent } from './components/buttonAdd/buttonAdd.component';
import { TableHeaderComponent } from './components/tableHeader/tableHeader.component';
import { SpinnerComponent } from './components/spinner/spinner.component';
import { UserComponent } from './routes/user/user.component';
import { LoginComponent } from './routes/user/login/login.component';
import { RegisterComponent } from './routes/user/register/register.component';

import { DateFormatPipe } from 'src/helpers/DateFormat.pipe';
import { StepPipe } from 'src/helpers/Step.pipe';

import { OrderService } from './services/order.service';
import { SpinnerService } from './services/spinner.service';
import { DrawerService } from './services/drawer.service';

@NgModule({
  declarations: [
    AppComponent,
    DashboardComponent,
    DialogComponent,
    DialogCarouselComponent,
    AttributesComponent,
    AttributesNavigationComponent,
    ColorComponent,
    FabricComponent,
    SizeComponent,
    SetComponent,
    ItemComponent,
    ItemsComponent,
    OrderComponent,
    OrdersComponent,
    UserComponent,
    LoginComponent,
    RegisterComponent,
    ProfileComponent,
    ToolbarComponent,
    TitleComponent,
    LinksComponent,
    CustomersComponent,
    CustomerComponent,
    ButtonAddComponent,
    TableHeaderComponent,
    SpinnerComponent,
    DateFormatPipe,
    StepPipe,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    BrowserAnimationsModule,
    FormsModule,
    ReactiveFormsModule,
    NgxMaskDirective,
    NgxMaskPipe,
    MatButtonModule,
    MatToolbarModule,
    MatTabsModule,
    MatIconModule,
    MatTableModule,
    MatInputModule,
    MatFormFieldModule,
    MatPaginatorModule,
    MatSortModule,
    MatExpansionModule,
    MatDialogModule,
    MatStepperModule,
    MatProgressSpinnerModule,
    MatSidenavModule,
    MatCheckboxModule,
    MatMenuModule,
    MatCardModule,
    MatDividerModule,
    MatAutocompleteModule,
    MatSelectModule,
    MatDatepickerModule,
    MatNativeDateModule,
    MatRadioModule,
    NgxDropzoneModule,
    NgxMatNumberInputSpinnerModule,
    ToastrModule.forRoot({
      timeOut: 4000,
      positionClass: 'toast-bottom-right',
      preventDuplicates: true,
      progressBar: true,
      progressAnimation: 'decreasing',
      toastClass: 'ngx-toastr',
      titleClass: 'toastr-title',
    }),
  ],
  providers: [
    OrderService,
    SpinnerService,
    DrawerService,
    provideNgxMask(),
    { provide: MAT_DATE_LOCALE, useValue: 'br' },
  ],
  bootstrap: [AppComponent],
})
export class AppModule {}
