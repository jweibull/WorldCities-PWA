import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) { }

  get<User>(email: string): Observable<User> {
    const url = "api/user/getuser"
    const params = new HttpParams().set("username", email);
    return this.http.get<User>(url, { params });
  }

  put<User>(user: User): Observable<User> {
    const url = "api/user/adduser";
    return this.http.put<User>(url, user)
  }


}
