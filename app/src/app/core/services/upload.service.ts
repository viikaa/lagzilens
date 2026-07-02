import { HttpClient } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { environment } from '../../../environments/environment';
import { GasPayload, GasResponse } from '../models/upload.model';

@Injectable({ providedIn: 'root' })
export class UploadService {
  private readonly endpoint = environment.gasEndpoint;

  constructor(private http: HttpClient) {}

  uploadImage(payload: GasPayload): Observable<GasResponse> {
    return new Observable((observer) => {
      const xhr = new XMLHttpRequest();

      xhr.addEventListener('load', () => {
        if (xhr.status >= 200 && xhr.status < 300) {
          try {
            const parsed = JSON.parse(xhr.responseText) as GasResponse;
            observer.next(parsed);
            observer.complete();
          } catch {
            observer.error(new Error('Érvénytelen válasz a szervertől.'));
          }
        } else {
          observer.error(new Error(`Szerver hiba: ${xhr.status}`));
        }
      });

      xhr.addEventListener('error', () => {
        observer.error(new Error('Sikertelen feltöltés.'));
      });

      xhr.open('POST', this.endpoint);
      xhr.setRequestHeader('Content-Type', 'text/plain');
      xhr.send(JSON.stringify(payload));

      return () => xhr.abort();
    });
  }
}
