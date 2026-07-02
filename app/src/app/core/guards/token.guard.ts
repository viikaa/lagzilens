import { HttpClient, HttpHeaders } from '@angular/common/http';
import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { environment } from '../../../environments/environment';

interface TokenValidationResponse {
  valid: boolean;
}

export const tokenGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const http = inject(HttpClient);
  const token = route.queryParamMap.get('token');

  if (!token) {
    return of(router.parseUrl('/no-access'));
  }

  const headers = new HttpHeaders({ 'Content-Type': 'text/plain' });

  return http
    .post<TokenValidationResponse>(
      environment.gasEndpoint,
      JSON.stringify({ action: 'validateToken', token }),
      { headers }
    )
    .pipe(
      map((response) =>
        response.valid ? true : router.parseUrl('/no-access')
      ),
      catchError(() => of(router.parseUrl('/no-access')))
    );
};
