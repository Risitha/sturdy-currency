import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class CurrencyService {

  constructor(private http: HttpClient) {}

  getCurrencyExchangeRates(baseCurrency: string, currencies: string): Observable<any> {
    const params = new HttpParams()
      .set('base_currency', baseCurrency)
      .set('currencies', currencies);

    return this.http.get('https://api.freecurrencyapi.com/v1/latest', { params });
  }

  getHistoricalRates(
    baseCurrency: string,
    targetCurrency: string,
    dateFrom: string,
    dateTo: string
  ): Observable<any> {
    const url = `https://api.freecurrencyapi.com/v1/historical`;
    const params = new HttpParams()
      .set('base_currency', baseCurrency)
      .set('currencies', targetCurrency)
      .set('date_from', dateFrom)
      .set('date_to', dateTo);

    return this.http.get(url, { params });
  }
}
