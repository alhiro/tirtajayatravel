import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from './models/package.model';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<PackageModel> {
    return this.httpService.packageList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: PackageModel): Observable<PackageModel> {
    return this.httpService.packageEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: PackageModel): Observable<PackageModel> {
    return this.httpService.packageCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
