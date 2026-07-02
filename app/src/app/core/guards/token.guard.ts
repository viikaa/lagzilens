import { inject } from '@angular/core';
import {
  ActivatedRouteSnapshot,
  CanActivateFn,
  Router,
  RouterStateSnapshot,
  UrlTree,
} from '@angular/router';
import { Observable, of } from 'rxjs';
import { environment } from '../../../environments/environment';

interface TokenValidationResponse {
  valid: boolean;
}

/**
 * Asynchronous route guard that validates the URL token against the
 * Google Apps Script backend using a direct XMLHttpRequest.
 *
 * No token value is stored in the frontend.
 */
export const tokenGuard: CanActivateFn = (
  route: ActivatedRouteSnapshot,
  _state: RouterStateSnapshot
): Observable<boolean | UrlTree> => {
  const router = inject(Router);
  const token = route.queryParamMap.get('token');

  if (!token) {
    return of(router.parseUrl('/no-access'));
  }

  return new Observable<boolean | UrlTree>((observer) => {
    const xhr = new XMLHttpRequest();
    xhr.open('POST', environment.gasEndpoint);
    xhr.setRequestHeader('Content-Type', 'text/plain');

    xhr.onload = () => {
      try {
        const response = JSON.parse(
          xhr.responseText
        ) as TokenValidationResponse;
        observer.next(
          response.valid ? true : router.parseUrl('/no-access')
        );
      } catch {
        observer.next(router.parseUrl('/no-access'));
      }
      observer.complete();
    };

    xhr.onerror = () => {
      observer.next(router.parseUrl('/no-access'));
      observer.complete();
    };

    xhr.onabort = () => {
      observer.next(router.parseUrl('/no-access'));
      observer.complete();
    };

    xhr.send(JSON.stringify({ action: 'validateToken', token }));
  });
};
