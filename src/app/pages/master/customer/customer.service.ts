import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { CustomerModel } from './models/customer.model';
import { AddressModel } from './models/address.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private httpService: HttpService) {}

  list(context: PaginationContext): Observable<CustomerModel> {
    return this.httpService.customerList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: CustomerModel): Observable<CustomerModel> {
    return this.httpService.customerEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: CustomerModel): Observable<CustomerModel> {
    return this.httpService.customerCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  // Address
  editAddress(context: AddressModel): Observable<AddressModel> {
    return this.httpService.customerEditAddress(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  createAddress(context: AddressModel): Observable<AddressModel> {
    return this.httpService.customerCreateAddress(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
