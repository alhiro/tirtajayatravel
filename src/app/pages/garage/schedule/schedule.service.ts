import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { ScheduleModel } from './models/schedule.model';

@Injectable({
  providedIn: 'root',
})
export class ScheduleService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<ScheduleModel> {
    return this.httpService.scheduleList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: ScheduleModel): Observable<ScheduleModel> {
    return this.httpService.scheduleEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: ScheduleModel): Observable<ScheduleModel> {
    return this.httpService.scheduleCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  delete(context: ScheduleModel): Observable<ScheduleModel> {
    return this.httpService.scheduleDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
