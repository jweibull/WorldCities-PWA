import { Component, OnInit, AfterViewInit, ViewChild } from '@angular/core';
import { MatPaginator, PageEvent } from '@angular/material/paginator';
import { MatSort, SortDirection } from '@angular/material/sort';
import { MatTableDataSource } from '@angular/material/table';
import { Subject, BehaviorSubject } from 'rxjs';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

import { CountryService } from '../services/country-services/country-service';
import { ApiResult } from '../services/api-result';
import { Country } from '../services/country-services/country';


@Component({
  selector: 'app-countries',
  templateUrl: './countries.component.html',
  styleUrls: ['./countries.component.scss']
})

export class CountriesComponent implements OnInit, AfterViewInit{

  defaultPageIndex: number = 0;
  defaultPageSize: number = 10;
  defaultFilterColumn: string = "name";
  filterQuery: string = "";
  filterTextChanged: Subject<string> = new Subject<string>();
  defaultDebounceTime: number = 750;

  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  defaultSortColumn: string = "name";
  defaultSortDirection: SortDirection = "asc";
  displayedColumns: string[] = ["id", "name", "iso2", "iso3", "totCities"];
  countries: MatTableDataSource<Country> = new MatTableDataSource<Country>();

  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  constructor(private countryService: CountryService) {}

  ngOnInit(): void {
    this.loadData();
  }

  ngAfterViewInit(): void {
    this.sort.direction = this.defaultSortDirection;
    this.subscribeDebouncer();
  }

  inputEvent(event: Event) {
    let query: string = (event.target as HTMLInputElement).value;
    this.onFilterTextChanged(query);
  }

  subscribeDebouncer() {
    this.filterTextChanged
      .pipe(debounceTime(this.defaultDebounceTime), distinctUntilChanged())
      .subscribe(query => {
        this.loadData(query);
    });
  }

  // debounce filter text changes
  onFilterTextChanged(filterText: string) {
    this.filterTextChanged.next(filterText);
  }

  loadData(query: string = "") {
    this.loading.next(true);
    var pageEvent = new PageEvent();
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
    this.countryService.getData<ApiResult<Country>>(
                                                event.pageIndex,
                                                event.pageSize,
                                                sortColumn,
                                                sortOrder,
                                                filterColumn,
                                                filterQuery).subscribe({
      next: result => {
        this.paginator.length = result.totalCount;
        this.paginator.pageIndex = result.pageIndex;
        this.paginator.pageSize = result.pageSize;
        this.countries = new MatTableDataSource<Country>(result.data);
      },
      error: err => {
        console.error(err);
      },
      complete: () => {
        this.loading.next(false);
      }
    });
  }
}
