import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { Dates, PaginationContext } from '@app/@shared/interfaces/pagination';
import { CashoutModel } from './models/cashout.model';

@Injectable({
  providedIn: 'root',
})
export class CashoutService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<CashoutModel> {
    return this.httpService.cashoutList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: CashoutModel): Observable<CashoutModel> {
    return this.httpService.cashoutEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: CashoutModel): Observable<CashoutModel> {
    return this.httpService.cashoutCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  delete(context: CashoutModel): Observable<CashoutModel> {
    return this.httpService.cashoutDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  listRecapitulation(context: Dates): Observable<CashoutModel> {
    return this.httpService.recapitulationList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  depositDaily(context: any): Observable<any> {
    return this.httpService.depositDaily(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
