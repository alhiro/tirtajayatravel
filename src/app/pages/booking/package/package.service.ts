import { Injectable } from '@angular/core';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { PackageModel } from './models/package.model';
import { RecipientModel } from './models/recipient.model';
import { SenderModel } from './models/sender.model';
import { AddressModel } from '@app/pages/master/customer/models/address.model';
import { GoSendModel } from './models/gosend';

@Injectable({
  providedIn: 'root',
})
export class PackageService {
  constructor(private httpService: HttpService) {}

  search(context: ExtendedPaginationContext): Observable<GoSendModel> {
    return this.httpService.searchPackage(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  list(context: ExtendedPaginationContext): Observable<PackageModel> {
    return this.httpService.packageList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  listAll(context: PaginationContext): Observable<PackageModel> {
    return this.httpService.packageListAll(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  listCom(context: PaginationContext): Observable<PackageModel> {
    return this.httpService.packageListCom(context).pipe(
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

  patch(context: PackageModel): Observable<PackageModel> {
    return this.httpService.packagePatch(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  patchGroup(context: any): Observable<any> {
    return this.httpService.packagePatchGroup(context).pipe(
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

  delete(context: PackageModel): Observable<PackageModel> {
    return this.httpService.packageDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  createSender(context: SenderModel): Observable<RecipientModel> {
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

  editSender(context: SenderModel): Observable<RecipientModel> {
    return this.httpService.senderEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  editRecipient(context: RecipientModel): Observable<RecipientModel> {
    return this.httpService.recipientEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  updateAddress(context: AddressModel): Observable<AddressModel> {
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

  listSP(context: ExtendedPaginationContext): Observable<PackageModel> {
    return this.httpService.SpList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  editSP(context: GoSendModel): Observable<GoSendModel> {
    return this.httpService.SpEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  editSPGroup(context: GoSendModel[]): Observable<GoSendModel> {
    return this.httpService.SpEditGroup(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  createSP(context: any): Observable<any> {
    return this.httpService.spCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  listDeposit(context: any): Observable<any> {
    return this.httpService.listDeposit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  depositDaily(context: any): Observable<any> {
    return this.httpService.depositDailyFullQuery(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  deleteSP(context: GoSendModel): Observable<GoSendModel> {
    return this.httpService.SpDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }
}
