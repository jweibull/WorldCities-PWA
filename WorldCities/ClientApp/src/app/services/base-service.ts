import { HttpClient } from "@angular/common/http";
import { Observable } from "rxjs";

export abstract class BaseService {

  constructor(protected http: HttpClient) {
  }

  abstract getData<ApiResult>(
                              pageIndex: number,
                              pageSize: number,
                              sortColumn: string,
                              sortOrder: string,
                              filterColumn: string,
                              filterQuery: string): Observable<ApiResult>;

    abstract get<T>(id: number): Observable<T>;
    abstract put<T>(item: T): Observable<T>;
    abstract post<T>(item: T): Observable<T>;
}
