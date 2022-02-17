import { Inject, Injectable, PLATFORM_ID } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { throwError, Observable, concat, BehaviorSubject } from 'rxjs';
import { map, catchError, tap, take, filter } from 'rxjs/operators';
import { TokenResponse } from './token.response';
import { TokenRequest } from './token.request';
import { UserService } from '../user-services/user-service';
import { User } from '../user-services/user';

@Injectable({
  providedIn: 'root',
})
export class AuthorizeService {
  private authKey: string = 'auth';

  private clientId: string = 'WorldCities';

  private username: string = "";

  private userLoggedIn: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(false);
  private userSubject: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);

  constructor(
    private http: HttpClient,
    private userService: UserService,
    @Inject(PLATFORM_ID) private platformId: any
  ) {}

  // performs the login
  public login(username: string, password: string): Observable<boolean> {
    const url = 'api/token/auth';
    let data: TokenRequest = {
      username: username,
      password: password,
      clientId: this.clientId,
      refreshToken: '',
      // required when signing up with username/password
      grantType: 'password',
      // space-separated list of scopes for which the token is issued
      scope: 'offline_access profile email',
    };
    return this.getAuthFromServer(url, data);
  }

  // performs the logout
  public logout(): boolean {
    this.setAuth(null);
    this.username = "";
    this.userSubject.next(null);
    this.userLoggedIn.next(false);
    return true;
  }

  // try to refresh token
  public refreshToken(): Observable<boolean> {
    var url = 'api/token/auth';
    var data: TokenRequest = {
      username: this.username,
      password: '',
      clientId: this.clientId,
      // required when signing up with username/password
      grantType: 'refresh_token',
      refreshToken: this.getAuth()!.refreshToken,
      // space-separated list of scopes for which the token is issued
      scope: 'offline_access profile email',
    };
    return this.getAuthFromServer(url, data);
  }

  // retrieve the access & refresh tokens from the server
  private getAuthFromServer(url: string, data: TokenRequest): Observable<boolean> {
    return this.http.post<TokenResponse>(url, data).pipe(
      map((res: TokenResponse) => {
        let token = res && res.token;
        // if the token is there, login has been successful
        if (token) {
          // store username and jwt token
          res.username = data.username;
          this.setAuth(res);
          // successful login
          this.getUserFromStorage(data.username);
          this.isLoggedIn();
          return true;
        }
        // failed login
        return throwError(() => new Error('Unauthorized')) as any;
      }),
      catchError((err: any) => {
        return new Observable<any>(err);
      })
    );
  }

  // Persist auth into localStorage or removes it if a NULL argument is given
  setAuth(auth: TokenResponse | null): boolean {
    if (auth) {
      localStorage.setItem(this.authKey, JSON.stringify(auth));
    } else {
      localStorage.removeItem(this.authKey);
    }
    return true;
  }

  // Retrieves the auth JSON object (or NULL if none)
  getAuth(): TokenResponse | null {
    var i = localStorage.getItem(this.authKey);
    if (i) {
      return JSON.parse(i);
    } else {
      return null;
    }
  }

  // Returns TRUE if the user is logged in, FALSE otherwise.
  isLoggedIn(): boolean {
    let logged = localStorage.getItem(this.authKey) != null;
    this.userLoggedIn.next(logged);
    return logged;
  }

  isLoggedInAsync(): Observable<boolean> {
    return this.userLoggedIn.asObservable();
  }

  public getUser(): Observable<User | null> {
    return this.userSubject.asObservable();
  }

  private getUserFromStorage(username:string) {
    this.userService.get<User>(username).subscribe({
      next: (user) => {
        this.userSubject.next(user);
      },
    });
  }
}
