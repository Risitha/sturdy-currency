import { Injectable } from '@angular/core';
import {
  HttpInterceptor,
  HttpRequest,
  HttpHandler,
  HttpEvent,
} from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable()
export class ApiInterceptor implements HttpInterceptor {
  private apiKey = 'fca_live_9cuXyLqkVg96mIhe7qOhQRzbWsdashFqZYqwGgbd';

  intercept(
    request: HttpRequest<any>,
    next: HttpHandler
  ): Observable<HttpEvent<any>> {
    // Clone the request and set the API key in the headers
    const clonedRequest = request.clone({
      setHeaders: {
        'apikey': this.apiKey,
      },
    });

    // Pass the cloned request to the next handler
    return next.handle(clonedRequest);
  }
}
