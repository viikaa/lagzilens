import {
  HttpClient,
  HttpEvent,
  HttpEventType,
  HttpHeaders,
  HttpRequest,
} from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable, catchError, map, throwError } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GasPayload, GasResponse } from '../models/upload.model';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly endpoint = environment.gasEndpoint;

  constructor(private http: HttpClient) {}

  uploadImage(
    payload: GasPayload
  ): Observable<{ progress: number; response?: GasResponse }> {
    const headers = new HttpHeaders({
      'Content-Type': 'text/plain;charset=utf-8',
    });

    const req = new HttpRequest('POST', this.endpoint, JSON.stringify(payload), {
      reportProgress: true,
      headers,
    });

    return this.http.request<GasResponse>(req).pipe(
      map((event: HttpEvent<GasResponse>) => {
        switch (event.type) {
          case HttpEventType.Sent:
            return { progress: 0 };
          case HttpEventType.UploadProgress:
            const progress = event.total
              ? Math.round((100 * event.loaded) / event.total)
              : 50;
            return { progress };
          case HttpEventType.Response:
            return { progress: 100, response: event.body ?? undefined };
          default:
            return { progress: 0 };
        }
      }),
      catchError((error) => {
        let message = 'Upload failed. Please try again.';
        if (error?.error?.message) {
          message = error.error.message;
        } else if (error?.message) {
          message = error.message;
        }
        return throwError(() => new Error(message));
      })
    );
  }
}
