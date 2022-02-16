import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { BaseService } from '../base-service';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})

export class CountryService extends BaseService {

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
    const url = 'api/Countries';
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

  get<Country>(id: number): Observable<Country> {
    const url = "api/Countries/" + id;
    return this.http.get<Country>(url);
  }

  put<Country>(item: any): Observable<Country> {
    const url = "api/Countries/" + item.id;
    return this.http.put<Country>(url, item);
  }

  post<Country>(item: any): Observable<Country> {
    const url = "api/Countries";
    return this.http.post<Country>(url, item);
  }

  isDupeField(countryId: number, fieldName: string, fieldValue: string): Observable<boolean> {
    var params = new HttpParams()
      .set("countryId", countryId)
      .set("fieldName", fieldName)
      .set("fieldValue", fieldValue);
    const url = "api/Countries/IsDupeField";
    return this.http.post<boolean>(url, null, { params });
  }
}
