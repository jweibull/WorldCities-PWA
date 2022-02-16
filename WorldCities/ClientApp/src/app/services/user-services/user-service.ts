import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class UserService {

  constructor(private http: HttpClient) { }

  get<User>(email: string): Observable<User> {
    const url = "api/user/GetUser/" + email;
    return this.http.get<User>(url);
  }

  put<User>(user: User): Observable<User> {
    const url = "api/user/adduser";
    return this.http.put<User>(url, user)
  }


}
