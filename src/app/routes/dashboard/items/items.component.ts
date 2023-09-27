import { Component, OnInit, ViewChild } from '@angular/core';
import { MatPaginator } from '@angular/material/paginator';
import { MatSort } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { formatHeader } from 'src/helpers/ColumnHeaders';
import { ItemService } from 'src/app/services/item.service';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-items',
  templateUrl: './items.component.html',
  styleUrls: ['./items.component.scss'],
})
export class ItemsComponent implements OnInit {
  public dataSource: any;
  displayedColumns: string[] = ['name', 'set', 'price'];

  @ViewChild(MatPaginator) paginator?: MatPaginator;
  @ViewChild(MatSort) sort?: MatSort;

  constructor(
    private _itemService: ItemService,
    private _toastrService: ToastrService
  ) {}

  ngOnInit() {
    this.getItems();
  }

  public columnHeader(header: string): string {
    return formatHeader(header);
  }

  getItems() {
    this._itemService.getItems().subscribe({
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
    });
  }

  filterItems(value: string) {
    this.dataSource.filter = value.trim().toLowerCase();
  }
}
