import { HttpInterceptorFn, HttpErrorResponse } from '@angular/common/http';
import { inject } from '@angular/core';
import { CookieService } from 'ngx-cookie-service';
import { catchError, throwError } from 'rxjs';

export const apiHeadsInterceptor: HttpInterceptorFn = (req, next) => {

  const cookie = inject(CookieService);
  const token = cookie.get("user");

  console.log("TOKEN:", token);
  console.log("URL:", req.url);

  if (token) {
    const auth = req.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next(auth).pipe(
      catchError((error: HttpErrorResponse) => {
        if (error.status === 400 || error.status === 401) {
          document.cookie = 'user=; Max-Age=0; path=/;';
          document.cookie = 'user=; Max-Age=0;';
          document.cookie = 'userInfo=; Max-Age=0; path=/;';
          document.cookie = 'userInfo=; Max-Age=0;';
        }
        return throwError(() => error);
      })
    );
  }

  return next(req);
};