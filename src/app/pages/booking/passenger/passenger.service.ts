import { Injectable } from '@angular/core';
import { ExtendedPaginationContext, PaginationContext } from '@app/@shared/interfaces/pagination';
import { HttpService } from '@app/services/http.service';
import { Observable, map } from 'rxjs';
import { PassengerModel } from './models/passenger.model';
import { WaybillModel } from './models/waybill.model';
import { DestinationModel } from './models/destination';
import { AddressModel } from '@app/pages/master/customer/models/address.model';
import { GoSendModel } from '../package/models/gosend';

@Injectable({
  providedIn: 'root',
})
export class PassengerService {
  constructor(private httpService: HttpService) {}

  list(context: ExtendedPaginationContext): Observable<PassengerModel> {
    return this.httpService.passengerList(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  listAll(context: ExtendedPaginationContext): Observable<PassengerModel> {
    return this.httpService.passengerListAll(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  edit(context: PassengerModel): Observable<PassengerModel> {
    return this.httpService.passengerEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  patch(context: PassengerModel): Observable<PassengerModel> {
    return this.httpService.passengerPatch(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  create(context: PassengerModel): Observable<PassengerModel> {
    return this.httpService.passengerCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  delete(context: PassengerModel): Observable<PassengerModel> {
    return this.httpService.passengerDelete(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  createWaybill(context: WaybillModel): Observable<WaybillModel> {
    return this.httpService.waybillCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  editWaybill(context: WaybillModel): Observable<WaybillModel> {
    return this.httpService.waybillEdit(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  createDestination(context: DestinationModel): Observable<DestinationModel> {
    return this.httpService.destinationCreate(context).pipe(
      map((result) => {
        if (!result) {
          return result;
        }
        return result;
      })
    );
  }

  editDestination(context: DestinationModel): Observable<DestinationModel> {
    return this.httpService.destinationEdit(context).pipe(
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

  listSP(context: PaginationContext): Observable<PassengerModel> {
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
}
