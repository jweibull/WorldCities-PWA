import { Inject, Injectable, PLATFORM_ID, } from "@angular/core";
import { HttpClient } from "@angular/common/http";
import { throwError, Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';
import { TokenResponse } from './token.response';
import { TokenRequest } from './token.request';
import { UserService } from '../user-services/user-service';


@Injectable({
  providedIn: 'root',
})

export class AuthorizeService {
    authKey: string = "auth";

    clientId: string = "WorldCities";

    username: string = "";

    constructor(private http: HttpClient,
                private userService: UserService,
                @Inject(PLATFORM_ID) private platformId: any) {
    }

    // performs the login
    login(username: string, password: string): Observable<boolean> {
      const url = "api/token/auth";
      this.username = username;
      let data: TokenRequest = {
        username: username,
        password: password,
        clientId: this.clientId,
        refreshToken: "",
        // required when signing up with username/password
        grantType: "password",
        // space-separated list of scopes for which the token is issued
        scope: "offline_access profile email"
      };
      return this.getAuthFromServer(url, data);
    }

    // try to refresh token
    refreshToken(): Observable<boolean> {
      var url = "api/token/auth";
      var data: TokenRequest = {
        username: this.username,
        password: "",
        clientId: this.clientId,
        // required when signing up with username/password
        grantType: "refresh_token",
        refreshToken: this.getAuth()!.refreshToken,
        // space-separated list of scopes for which the token is issued
        scope: "offline_access profile email"
      };
      return this.getAuthFromServer(url, data);
    }

    // retrieve the access & refresh tokens from the server
    getAuthFromServer(url: string, data: TokenRequest): Observable<boolean> {
      return this.http.post<TokenResponse>(url, data).pipe(map((res:TokenResponse) => {
        let token = res && res.token;
        // if the token is there, login has been successful
        if (token) {
          // store username and jwt token
          res.username = data.username;
          this.setAuth(res);
          // successful login
          return true;
        }
        // failed login
        return throwError(() => new Error('Unauthorized')) as any;
      }), catchError((err: any) => {
        return new Observable<any>(err);
      }));
    }

    // performs the logout
    logout(): boolean {
      this.username = "";
      this.setAuth(null);
      return true;
    }

    // Persist auth into localStorage or removes it if a NULL argument is given
    setAuth(auth: TokenResponse | null): boolean {
        if (auth) {
            localStorage.setItem(
                this.authKey,
                JSON.stringify(auth));
        }
        else {
            localStorage.removeItem(this.authKey);
        }
        return true;
    }

    // Retrieves the auth JSON object (or NULL if none)
    getAuth(): TokenResponse | null {
        var i = localStorage.getItem(this.authKey);
        if (i) {
            return JSON.parse(i);
        }
        else {
            return null;
        }
    }

    // Returns TRUE if the user is logged in, FALSE otherwise.
    isLoggedIn(): boolean {
        return localStorage.getItem(this.authKey) != null;
    }

    getUserName(): Observable<string> {
      const i = this.getAuth();
      if (i) {
        return this.userService.get(i.username);
      }
      return of<string>("");
    }

    getDisplayName(): Observable<string> {
      const i = this.getAuth();
      if (i) {
        return of<string>(i.username);
      }
      return of<string>("");
    }
}
