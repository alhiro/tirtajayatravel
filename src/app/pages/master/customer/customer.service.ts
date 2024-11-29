import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, catchError, map, throwError } from 'rxjs';
import { Dates, PaginationContext } from '@app/@shared/interfaces/pagination';
import { CustomerModel, CustomerContext, CustomerIdContext } from './models/customer.model';
import { AddressModel } from './models/address.model';
import { MatSnackBar } from '@angular/material/snack-bar';

@Injectable({
  providedIn: 'root',
})
export class CustomerService {
  constructor(private httpService: HttpService, private snackbar: MatSnackBar) {}

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

  customerExport(context: PaginationContext): Observable<any> {
    return this.httpService.customerExport(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      }),
      catchError((error) => {
        // Handle the error and return an observable with a user-facing error message
        let errorMessage = 'An error occurred while downloading the Excel file';
        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = `Error: ${error.error.message}`;
        } else {
          // Server-side error
          errorMessage = `Server returned code: ${error.status}, error message is: ${error.message}`;
        }

        this.snackbar.open(errorMessage, '', {
          panelClass: 'snackbar-error',
          duration: 5000,
        });

        return throwError(() => new Error(errorMessage)); // Return a custom error
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

  delete(context: CustomerModel): Observable<AddressModel> {
    return this.httpService.customerDelete(context).pipe(
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
