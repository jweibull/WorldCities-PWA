import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class CityService extends BaseService {

  constructor(http: HttpClient) {
      super(http);
  }

  getData<ApiResult>(
                    pageIndex: number,
                    pageSize: number,
                    sortColumn: string,
                    sortOrder?: string,
                    filterColumn?: string,
                    filterQuery?: string): Observable<ApiResult>
  {
    const url = 'api/Cities';
    let params = new HttpParams()
      .set("pageIndex", pageIndex.toString())
      .set("pageSize", pageSize.toString())
      .set("sortColumn", sortColumn);
    if (sortOrder) {
      params = params.set("sortOrder", sortOrder);
    }
    if (filterQuery && filterColumn) {
      params = params
        .set("filterColumn", filterColumn)
        .set("filterQuery", filterQuery);
    }
    return this.http.get<ApiResult>(url, { params });
  }

  get<City>(id: number): Observable<City> {
    const url = "api/Cities/" + id;
    return this.http.get<City>(url);
  }

  put<City>(item: any): Observable<City> {
    const url = "api/Cities/" + item.id;
    return this.http.put<City>(url, item);
  }

  post<City>(item: any): Observable<City> {
    const url = "api/Cities";
    return this.http.post<City>(url, item);
  }

  getCountries<ApiResult>(
                          pageIndex: number,
                          pageSize: number,
                          sortColumn: string,
                          sortOrder?: string,
                          filterColumn?: string,
                          filterQuery?: string): Observable<ApiResult>
  {
    const url = "api/Countries";
    let params = new HttpParams()
      .set("pageIndex", pageIndex.toString())
      .set("pageSize", pageSize.toString())
      .set("sortColumn", sortColumn);
      if (sortOrder) {
        params = params.set("sortOrder", sortOrder);
      }
      if (filterQuery && filterColumn) {
        params = params
          .set("filterColumn", filterColumn)
          .set("filterQuery", filterQuery);
      }
    return this.http.get<ApiResult>(url, { params });
  }

  isDupeCity(item: any): Observable<boolean> {
    const url = "api/Cities/IsDupeCity";
    return this.http.post<boolean>(url, item);
  }
}

