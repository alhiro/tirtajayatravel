import { Injectable } from '@angular/core';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { CostModel } from './models/cost.model';

@Injectable({
  providedIn: 'root',
})
export class BsdService {
  constructor(private httpService: HttpService) {}

  costList(context: PaginationContext): Observable<CostModel> {
    return this.httpService.costList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  costEdit(context: CostModel): Observable<CostModel> {
    return this.httpService.costEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  costCreate(context: CostModel): Observable<CostModel> {
    return this.httpService.costCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
