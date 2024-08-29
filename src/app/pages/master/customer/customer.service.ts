import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { CustomerModel, CustomerContext, CustomerIdContext } from './models/customer.model';
import { AddressModel } from './models/address.model';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private httpService: HttpService) {}

  get(context: CustomerIdContext): Observable<CustomerContext> {
    return this.httpService.customerGet(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  list(context: PaginationContext): Observable<any> {
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
  getAddressList(context: CustomerContext): Observable<any> {
    return this.httpService.customerListAddress(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  getAddress(context: CustomerContext): Observable<CustomerContext> {
    return this.httpService.customerGetAddress(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

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

  deleteAddress(context: AddressModel): Observable<AddressModel> {
    return this.httpService.customerDeleteAddress(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
