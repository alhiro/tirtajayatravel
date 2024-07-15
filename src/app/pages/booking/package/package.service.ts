import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from './models/package.model';
import { RecipientModel } from './models/recipient.model';
import { SenderModel } from './models/sender.model';
import { AddressModel } from '@app/pages/master/customer/models/address.model';

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

  senderRecipient(context: SenderModel): Observable<RecipientModel> {
    return this.httpService.senderCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  createRecipient(context: RecipientModel): Observable<RecipientModel> {
    return this.httpService.recipientCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  updateAddress(context: AddressModel): Observable<RecipientModel> {
    return this.httpService.customerEditAddress(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  updateAddressDefault(context: any): Observable<any> {
    return this.httpService.customerEditAddresDefault(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
