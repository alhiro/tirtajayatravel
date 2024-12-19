import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { VendorModel } from './models/vendor.model';

@Injectable({
  providedIn: 'root',
})
export class VendorService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<VendorModel> {
    return this.httpService.vendorGarageList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: VendorModel): Observable<VendorModel> {
    return this.httpService.vendorGarageEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: VendorModel): Observable<VendorModel> {
    return this.httpService.vendorGarageCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  delete(context: VendorModel): Observable<VendorModel> {
    return this.httpService.vendorGarageDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
