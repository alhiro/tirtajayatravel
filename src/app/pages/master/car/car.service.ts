import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { CarModel } from './models/car.model';

@Injectable({
  providedIn: 'root',
})
export class CarService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<CarModel> {
    return this.httpService.carList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: CarModel): Observable<CarModel> {
    return this.httpService.carEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: CarModel): Observable<CarModel> {
    return this.httpService.carCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
