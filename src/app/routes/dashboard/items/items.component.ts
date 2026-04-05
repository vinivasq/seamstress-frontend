import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { MatDialog } from '@angular/material/dialog';
import { Router } from '@angular/router';
import { formatHeader } from 'src/helpers/ColumnHeaders';
import { ItemService } from 'src/app/services/item.service';
import { ToastrService } from 'ngx-toastr';
import { SpinnerService } from 'src/app/services/spinner.service';
import { DialogRegisterItemComponent } from 'src/app/components/dialogRegisterItem/dialogRegisterItem.component';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
})
export class ItemsComponent implements OnInit {
  public dataSource: any;
  displayedColumns: string[] = ['name', 'set', 'price'];
  user: any;
  showInactive = false;

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private _itemService: ItemService,
    private _toastrService: ToastrService,
    private _spinner: SpinnerService,
    private _dialog: MatDialog,
    private _router: Router
  ) {}

  ngOnInit() {
    this.user = JSON.parse(localStorage.getItem('user')!);
    this.getItems();
  }

  public columnHeader(header: string): string {
    return formatHeader(header);
  }

  getItems() {
    this._spinner.isLoading = true;

    this._itemService
      .getItems(!this.showInactive)
      .subscribe({
        next: (data: any) => {
          this.dataSource = new MatTableDataSource(data);
          this.dataSource.paginator = this.paginator;
          this.dataSource.sort = this.sort;
        },
        error: () =>
          this._toastrService.error(
            'Erro ao listar os modelos',
            'Erro ao listar'
          ),
      })
      .add(() => (this._spinner.isLoading = false));
  }

  filterItems(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }

  toggleShowInactive() {
    this.showInactive = !this.showInactive;
    this.getItems();
  }

  openRegisterDialog() {
    const dialogRef = this._dialog.open(DialogRegisterItemComponent);
    dialogRef.afterClosed().subscribe((result) => {
      if (result === 'individual') {
        this._router.navigate(['/item']);
      } else if (result === 'import') {
        this._router.navigate(['/import']);
      }
    });
  }
}
