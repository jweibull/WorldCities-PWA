import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { MatTableDataSource } from '@angular/material/table';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';

import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { City } from '../services/city-services/city';
import { CityService } from '../services/city-services/city-service';
import { ApiResult } from '../services/api-result';

@Component({
  selector: 'app-cities',
  templateUrl: './cities.component.html',
  styleUrls: ['./cities.component.scss']
})

export class CitiesComponent implements OnInit, AfterViewInit {
  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  defaultFilterColumn: string = "name";
  filterQuery: string = "";
  filterTextChanged: Subject<string> = new Subject<string>();
  defaultDebounceTime: number = 750;
  defaultSortColumn: string = "name";
  defaultSortDirection: SortDirection = "asc";

  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  displayedColumns: string[] = ["id", "name", "lat", "lon", "countryName"];

  cities: MatTableDataSource<City> = new MatTableDataSource<City>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;


  constructor(private cityService: CityService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.sort.direction = this.defaultSortDirection;
    this.subscribeDebouncer();
  }

  subscribeDebouncer() {
    this.filterTextChanged
      .pipe(debounceTime(this.defaultDebounceTime), distinctUntilChanged())
      .subscribe(query => {
        this.loadData(query);
    });
  }

  inputEvent(event: Event) {
    let query: string = (event.target as HTMLInputElement).value;
    this.onFilterTextChanged(query);
  }

  // debounce filter text changes
  onFilterTextChanged(filterText: string) {
    this.filterTextChanged.next(filterText);
  }

  loadData(query: string = "") {
    this.loading.next(true);

    let pageEvent = new PageEvent();
    pageEvent.pageIndex = this.defaultPageIndex;
    pageEvent.pageSize = this.defaultPageSize;

    this.filterQuery = query;

    this.getData(pageEvent);
  }

  getData(event: PageEvent) {
    const sortColumn: string = (this.sort)? this.sort.active : this.defaultSortColumn;
    const sortOrder: string = (this.sort)? this.sort.direction : this.defaultSortDirection;
    let filterColumn: any = (this.filterQuery)? this.defaultFilterColumn : null;
    let filterQuery: any = (this.filterQuery)? this.filterQuery : null;
    this.cityService.getData<ApiResult<City>>(
                                            event.pageIndex,
                                            event.pageSize,
                                            sortColumn,
                                            sortOrder,
                                            filterColumn,
                                            filterQuery)
      .subscribe({ next: result => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.cities = new MatTableDataSource<City>(result.data);
      },
      error: err => {
        console.error(err);
      },
      complete:() => {
        this.loading.next(false);
      }
    });
  }
}

