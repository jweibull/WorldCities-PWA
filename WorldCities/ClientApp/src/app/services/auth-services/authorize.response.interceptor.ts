import { Injectable, Injector } from "@angular/core";
import { Router } from "@angular/router";
import { HttpHandler, HttpEvent, HttpInterceptor, HttpRequest, HttpResponse, HttpErrorResponse } from "@angular/common/http";
import { AuthorizeService } from "./authorize.service";
import { Observable, throwError } from 'rxjs';
import { tap, mergeMap, catchError } from 'rxjs/operators';


@Injectable({
  providedIn: 'root',
})
export class AuthorizeResponseInterceptor implements HttpInterceptor {

    currentRequest!: HttpRequest<any>;
    auth!: AuthorizeService;

    constructor(private injector: Injector, private router: Router) { }

    intercept(
      request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
      this.auth = this.injector.get(AuthorizeService);
      var token = (this.auth.isLoggedIn()) ? this.auth.getAuth()!.token : null;
      if (token) {
        // save current request
        this.currentRequest = request;
        return next.handle(request).pipe(tap((event: HttpEvent<any>) => {
          if (event instanceof HttpResponse) {
            // do nothing
          }
        }),catchError((error: any) => {
          return this.handleError(error, next)
        }));
      } else {
        return next.handle(request);
      }
    }

    handleError(err: any, next: HttpHandler) {
      if (err instanceof HttpErrorResponse) {
        if (err.status === 401) {
          // JWT token might be expired:
          // try to get a new one using refresh token
          //console.log("Token expired. Attempting refresh...");
          // store current request into a local variable
          let previousRequest = this.currentRequest;
          return this.auth.refreshToken().pipe(mergeMap((refreshed) => {
            let token = (this.auth.isLoggedIn()) ? this.auth.getAuth()!.token : null;
            if (token) {
              previousRequest = previousRequest.clone({setHeaders: { Authorization: `Bearer ${token}` }});
              //console.log("header token reset");
            }
            return next.handle(previousRequest);
            }));
          }
        }
      return throwError(() => new Error(err));
    }
}
