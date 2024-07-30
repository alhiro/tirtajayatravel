import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';

@Injectable({
  providedIn: 'root',
})
export class DeliveryService {
  constructor(private httpService: HttpService) {}

  driver(context: PaginationContext): Observable<EmployeeyModel> {
    return this.httpService.driverList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  list(context: PaginationContext): Observable<EmployeeyModel> {
    return this.httpService.employeeList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: EmployeeyModel): Observable<EmployeeyModel> {
    return this.httpService.employeeEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: EmployeeyModel): Observable<EmployeeyModel> {
    return this.httpService.employeeCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
