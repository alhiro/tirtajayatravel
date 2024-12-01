import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { EmployeeyModel } from './models/employee.model';
import { PaginationContext } from '@app/@shared/interfaces/pagination';

@Injectable({
  providedIn: 'root',
})
export class EmployeeService {
  constructor(private httpService: HttpService) {}

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

  delete(context: EmployeeyModel): Observable<EmployeeyModel> {
    return this.httpService.employeeDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
