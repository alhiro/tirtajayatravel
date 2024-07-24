import { Injectable } from '@angular/core';
import { CommonApiService } from './common-api/common-api.service';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from '@env/environment.prod';
import { PaginationContext } from '@app/@shared/interfaces/pagination';
import { CategoryModel } from '@app/pages/master/category/models/category.model';
import { SubCategoryModel } from '@app/pages/master/sub-category/models/subcategory.model';
import { EmployeeyModel } from '@app/pages/master/employee/models/employee.model';
import { CarModel } from '@app/pages/master/car/models/car.model';
import { CustomerModel } from '@app/pages/master/customer/models/customer.model';
import { AddressModel } from '@app/pages/master/customer/models/address.model';
import { PackageModel } from '@app/pages/booking/package/models/package.model';
import { RecipientModel } from '@app/pages/booking/package/models/recipient.model';
import { SenderModel } from '@app/pages/booking/package/models/sender.model';
import { GoSendModel } from '@app/pages/booking/package/models/gosend';
import { PassengerModel } from '@app/pages/booking/passenger/models/passenger.model';
import { WaybillModel } from '@app/pages/booking/passenger/models/waybill.model';
import { DestinationModel } from '@app/pages/booking/passenger/models/destination';

@Injectable({
  providedIn: 'root',
})
export class HttpService {
  constructor(
    private commonApi: CommonApiService,
    private http: HttpClient // private utils: Utility
  ) {}

  public apiUrl: string = environment.serverUrl;

  // private createCompleteRoute(route: string, envAddress: string) {
  //   return `${envAddress}${route}`;
  // }

  // private generateHeaders(value: any, token: string, type = '') {
  //   const head: any = {};

  //   if (value) {
  //     Object.assign(head, { Authorization: 'Bearer ' + token });
  //   }

  //   if (type) {
  //     Object.assign(head, { 'Content-Type': type });
  //   }

  //   return {
  //     headers: new HttpHeaders(head),
  //   };
  // }

  // public delete(route: string, token) {
  //     return this.http.delete(
  //         this.createCompleteRoute(route, this.apiUrl),
  //         this.generateHeaders(true, token)
  //     );
  // }

  // loginGoogle(body: any): Observable<any> {
  //   return this.commonApi.postIdentity(
  //     'accounts:signInWithPassword?key=' + environment.firebaseConfig.apiKey,
  //     body
  //   ) as Observable<any>;
  // }

  // AUTH
  login(body: any): Observable<any> {
    return this.http.post('/auth/login', body) as Observable<any>;
  }

  registerUser(body: any): Observable<any> {
    return this.commonApi.post('/auth/register-user', body) as Observable<any>;
  }

  // BOOKING
  // Packager
  packageList(param: PaginationContext): Observable<any> {
    return this.commonApi.get('/package/list?limit=' + param.limit + '&page=' + param.page) as Observable<any>;
  }

  packageEdit(param: PackageModel): Observable<any> {
    const body = {
      package_id: param.package_id,
      sender_id: param.sender_id,
      recipient_id: param.recipient_id,
      city_id: param.city_id,
      employee_id: param.employee_id,
      category_id: param.category_id,
      go_send_id: param.go_send_id,
      description: param.description,
      cost: param.cost,
      discount: param.discount,
      payment: param.payment,
      origin_from: param.origin_from,
      level: param.level,
      request: param.request,
      request_description: param.request_description,
      note: param.note,
      status: param.status,
      status_package: param.status_package,
      resi_number: param.resi_number,
      photo: param.photo,
      print: param.print,
      move_time: param.move_time,
      book_date: param.book_date,
      send_date: param.send_date,
      check_payment: param.check_payment,
      check_sp: param.check_sp,
      check_date_sp: param.check_date_sp,
      taking_time: param.taking_time,
      taking_by: param.taking_by,
      taking_status: param.taking_status,
      office: param.office,
    };
    return this.commonApi.put('/package/update', body) as Observable<any>;
  }

  packagePatch(param: PackageModel): Observable<any> {
    const body = {
      package_id: param.package_id,
      sender_id: param.sender_id,
      recipient_id: param.recipient_id,
      city_id: param.city_id,
      employee_id: param.employee_id,
      category_id: param.category_id,
      go_send_id: param.go_send_id,
      description: param.description,
      cost: param.cost,
      discount: param.discount,
      payment: param.payment,
      origin_from: param.origin_from,
      level: param.level,
      request: param.request,
      request_description: param.request_description,
      note: param.note,
      status: param.status,
      status_package: param.status_package,
      resi_number: param.resi_number,
      photo: param.photo,
      print: param.print,
      move_time: param.move_time,
      book_date: param.book_date,
      send_date: param.send_date,
      check_payment: param.check_payment,
      check_sp: param.check_sp,
      check_date_sp: param.check_date_sp,
      taking_time: param.taking_time,
      taking_by: param.taking_by,
      taking_status: param.taking_status,
      office: param.office,
    };
    return this.commonApi.patch('/package/update', body) as Observable<any>;
  }

  packageCreate(param: PackageModel): Observable<any> {
    const body = {
      sender_id: param.sender_id,
      recipient_id: param.recipient_id,
      city_id: param.city_id,
      employee_id: param.employee_id,
      category_id: param.category_id,
      go_send_id: param.go_send_id,
      description: param.description,
      cost: param.cost,
      discount: param.discount,
      payment: param.payment,
      origin_from: param.origin_from,
      level: param.level,
      request: param.request,
      request_description: param.request_description,
      note: param.note,
      status: param.status,
      status_package: param.status_package,
      resi_number: param.resi_number,
      photo: param.photo,
      print: param.print,
      move_time: param.move_time,
      book_date: param.book_date,
      send_date: param.send_date,
      check_payment: param.check_payment,
      check_sp: param.check_sp,
      check_date_sp: param.check_date_sp,
      taking_time: param.taking_time,
      taking_by: param.taking_by,
      taking_status: param.taking_status,
      office: param.office,
    };
    return this.commonApi.post('/package/create', body) as Observable<any>;
  }

  senderCreate(param: SenderModel): Observable<any> {
    const body = {
      customer_id: param.customer_id,
      package_id: param.package_id,
      date: param.date,
      time: param.time,
    };
    return this.commonApi.post('/sender/create', body) as Observable<any>;
  }

  senderEdit(param: SenderModel): Observable<any> {
    const body = {
      sender_id: param.sender_id,
      customer_id: param.customer_id,
      package_id: param.package_id,
      date: param.date,
      time: param.time,
    };
    return this.commonApi.put('/sender/update', body) as Observable<any>;
  }

  recipientCreate(param: RecipientModel): Observable<any> {
    const body = {
      customer_id: param.customer_id,
      package_id: param.package_id,
      date: param.date,
      time: param.time,
      sign: param.sign,
      user_payment: param.user_payment,
      date_payment: param.date_payment,
      received_by: param.received_by,
    };
    return this.commonApi.post('/recipient/create', body) as Observable<any>;
  }

  recipientEdit(param: RecipientModel): Observable<any> {
    const body = {
      recipient_id: param.recipient_id,
      customer_id: param.customer_id,
      package_id: param.package_id,
      date: param.date,
      time: param.time,
      sign: param.sign,
      user_payment: param.user_payment,
      date_payment: param.date_payment,
      received_by: param.received_by,
    };
    return this.commonApi.put('/recipient/update', body) as Observable<any>;
  }

  SpList(param: PaginationContext): Observable<any> {
    return this.commonApi.get(
      '/go-send/list?limit=' + param.limit + '&page=' + param.page + '&search=' + param.search
    ) as Observable<any>;
  }

  SpEdit(param: GoSendModel): Observable<any> {
    const body = {
      go_send_id: param.go_send_id,
      employee_id: param.employee_id,
      car_id: param.car_id,
      city_id: param.city_id,
      package_id: param.package_id,
      passenger_id: param.passenger_id,
      telp: param.telp,
      send_time: param.send_time,
      send_date: param.send_date,
      sp_number: param.sp_number,
      sp_package: param.sp_package,
      sp_passenger: param.sp_passenger,
      bsd: param.bsd,
      bsd_passenger: param.bsd_passenger,
      box: param.box,
      bsd_box: param.bsd_box,
      description: param.description,
      status: param.status,
    };
    return this.commonApi.put('/go-send/update', body) as Observable<any>;
  }

  spCreate(param: GoSendModel): Observable<any> {
    const body = {
      employee_id: param.employee_id,
      car_id: param.car_id,
      city_id: param.city_id,
      package_id: param.package_id,
      passenger_id: param.passenger_id,
      telp: param.telp,
      send_time: param.send_time,
      send_date: param.send_date,
      sp_number: param.sp_number,
      sp_package: param.sp_package,
      sp_passenger: param.sp_passenger,
      bsd: param.bsd,
      bsd_passenger: param.bsd_passenger,
      box: param.box,
      bsd_box: param.bsd_box,
      description: param.description,
      status: param.status,
    };
    return this.commonApi.post('/go-send/create', body) as Observable<any>;
  }

  // Passenger
  passengerList(param: PaginationContext): Observable<any> {
    return this.commonApi.get(
      '/passenger/list?limit=' + param.limit + '&page=' + param.page + '&search=' + param.search
    ) as Observable<any>;
  }

  passengerEdit(param: PassengerModel): Observable<any> {
    const body = {
      passenger_id: param.passenger_id,
      waybill_id: param.waybill_id,
      destination_id: param.destination_id,
      city_id: param.city_id,
      employee_id: param.employee_id,
      go_send_id: param.go_send_id,
      tariff: param.tariff,
      discount: param.discount,
      agent_commission: param.agent_commission,
      other_fee: param.other_fee,
      book_date: param.book_date,
      total_passenger: param.total_passenger,
      payment: param.payment,
      status: param.status,
      status_passenger: param.status_passenger,
      note: param.note,
      description: param.description,
      resi_number: param.resi_number,
      cancel: param.cancel,
      move: param.move,
      position: param.position,
      charter: param.charter,
      check_payment: param.check_payment,
    };
    return this.commonApi.put('/passenger/update', body) as Observable<any>;
  }

  passengerPatch(param: PassengerModel): Observable<any> {
    const body = {
      passenger_id: param.passenger_id,
      waybill_id: param.waybill_id,
      destination_id: param.destination_id,
      city_id: param.city_id,
      employee_id: param.employee_id,
      go_send_id: param.go_send_id,
      tariff: param.tariff,
      discount: param.discount,
      agent_commission: param.agent_commission,
      other_fee: param.other_fee,
      book_date: param.book_date,
      total_passenger: param.total_passenger,
      payment: param.payment,
      status: param.status,
      status_passenger: param.status_passenger,
      note: param.note,
      description: param.description,
      resi_number: param.resi_number,
      cancel: param.cancel,
      move: param.move,
      position: param.position,
      charter: param.charter,
      check_payment: param.check_payment,
    };
    return this.commonApi.patch('/passenger/update', body) as Observable<any>;
  }

  passengerCreate(param: PassengerModel): Observable<any> {
    const body = {
      waybill_id: param.waybill_id,
      destination_id: param.destination_id,
      city_id: param.city_id,
      employee_id: param.employee_id,
      go_send_id: param.go_send_id,
      tariff: param.tariff,
      discount: param.discount,
      agent_commission: param.agent_commission,
      other_fee: param.other_fee,
      book_date: param.book_date,
      total_passenger: param.total_passenger,
      payment: param.payment,
      status: param.status,
      status_passenger: param.status_passenger,
      note: param.note,
      description: param.description,
      resi_number: param.resi_number,
      cancel: param.cancel,
      move: param.move,
      position: param.position,
      charter: param.charter,
      check_payment: param.check_payment,
    };
    return this.commonApi.post('/passenger/create', body) as Observable<any>;
  }

  waybillCreate(param: WaybillModel): Observable<any> {
    const body = {
      customer_id: param.customer_id,
      passenger_id: param.passenger_id,
      date: param.date,
      time: param.time,
    };
    return this.commonApi.post('/waybill/create', body) as Observable<any>;
  }

  waybillEdit(param: WaybillModel): Observable<any> {
    const body = {
      waybill_id: param.waybill_id,
      customer_id: param.customer_id,
      passenger_id: param.passenger_id,
      date: param.date,
      time: param.time,
    };
    return this.commonApi.put('/waybill/update', body) as Observable<any>;
  }

  destinationCreate(param: DestinationModel): Observable<any> {
    const body = {
      customer_id: param.customer_id,
      passenger_id: param.passenger_id,
      date: param.date,
      time: param.time,
    };
    return this.commonApi.post('/destination/create', body) as Observable<any>;
  }

  destinationEdit(param: DestinationModel): Observable<any> {
    const body = {
      destination_id: param.destination_id,
      customer_id: param.customer_id,
      passenger_id: param.passenger_id,
      date: param.date,
      time: param.time,
    };
    return this.commonApi.put('/destination/update', body) as Observable<any>;
  }

  // MASTER
  // Category
  categoryAll(): Observable<any> {
    return this.commonApi.get('/category/list') as Observable<any>;
  }

  categoryList(param: PaginationContext): Observable<any> {
    return this.commonApi.get('/category/list?limit=' + param.limit + '&page=' + param.page) as Observable<any>;
  }

  categoryEdit(param: CategoryModel): Observable<any> {
    const body = {
      category_id: param.category_id,
      name: param.name,
    };
    return this.commonApi.put('/category/update', body) as Observable<any>;
  }

  categoryCreate(param: CategoryModel): Observable<any> {
    const body = {
      name: param.name,
    };
    return this.commonApi.post('/category/create', body) as Observable<any>;
  }

  // Sub Category
  subCategoryList(param: PaginationContext): Observable<any> {
    return this.commonApi.get('/category-sub/list?limit=' + param.limit + '&page=' + param.page) as Observable<any>;
  }

  subCategoryEdit(param: SubCategoryModel): Observable<any> {
    const body = {
      category_sub_id: param.category_sub_id,
      category_id: param.category_id,
      name: param.name,
    };
    return this.commonApi.put('/category-sub/update', body) as Observable<any>;
  }

  subCategoryCreate(param: SubCategoryModel): Observable<any> {
    const body = {
      category_id: param.category_id,
      name: param.name,
    };
    return this.commonApi.post('/category-sub/create', body) as Observable<any>;
  }

  // Employee
  driverList(param: PaginationContext): Observable<any> {
    return this.commonApi.get(
      '/employee/driver?limit=' + param.limit + '&page=' + param.page + '&search=' + param.search
    ) as Observable<any>;
  }

  employeeList(param: PaginationContext): Observable<any> {
    return this.commonApi.get(
      '/employee/list?limit=' + param.limit + '&page=' + param.page + '&search=' + param.search
    ) as Observable<any>;
  }

  employeeEdit(param: EmployeeyModel): Observable<any> {
    const body = {
      employee_id: param.employee_id,
      car_id: param.car_id,
      city_id: param.city_id,
      level_id: param.level_id,
      nik: param.nik,
      name: param.name,
      telp: param.telp,
      photo: param.photo,
      active: param.active,
      log: param.log,
    };
    return this.commonApi.put('/employee/update', body) as Observable<any>;
  }

  employeeCreate(param: EmployeeyModel): Observable<any> {
    const body = {
      car_id: param.car_id,
      city_id: param.city_id,
      level_id: param.level_id,
      nik: param.nik,
      name: param.name,
      telp: param.telp,
      photo: param.photo,
      active: param.active,
      log: param.log,
    };
    return this.commonApi.post('/employee/create', body) as Observable<any>;
  }

  // Customer
  customerGet(param: CustomerModel): Observable<any> {
    return this.commonApi.get('/customer/get?customer_id=' + param.customer_id) as Observable<any>;
  }

  customerList(param: PaginationContext): Observable<any> {
    return this.commonApi.get(
      '/customer/list?limit=' + param.limit + '&page=' + param.page + '&search=' + param.search
    ) as Observable<any>;
  }

  customerEdit(param: CustomerModel): Observable<any> {
    const body = {
      customer_id: param.customer_id,
      business_id: param.business_id,
      company_id: param.company_id,
      name: param.name,
      telp: param.telp,
      admin: param.admin,
      address: param.address,
      status: param.status,
    };
    return this.commonApi.put('/customer/update', body) as Observable<any>;
  }

  customerCreate(param: CustomerModel): Observable<any> {
    const body = {
      business_id: param.business_id,
      company_id: param.company_id,
      name: param.name,
      telp: param.telp,
      admin: param.admin,
      address: param.address,
      status: param.status,
    };
    return this.commonApi.post('/customer/create', body) as Observable<any>;
  }

  customerEditAddress(param: AddressModel): Observable<any> {
    const body = {
      address_id: param.address_id,
      customer_id: param.customer_id,
      name: param.name,
      address: param.address,
      telp: param.telp,
      default: param.default,
      longitude: param.longitude,
      latitude: param.latitude,
      zoom: param.zoom,
      description: param.description,
      used: param.used,
    };
    return this.commonApi.put('/address/update', body) as Observable<any>;
  }

  customerEditAddresDefault(param: any): Observable<any> {
    const body = {
      address_id: param.address_id,
      customer_id: param.customer_id,
      default: param.default,
    };

    return this.commonApi.put('/address/update', body) as Observable<any>;
  }

  customerCreateAddress(param: AddressModel): Observable<any> {
    const body = {
      customer_id: param.customer_id,
      name: param.name,
      address: param.address,
      telp: param.telp,
      default: param.default,
      longitude: param.longitude,
      latitude: param.latitude,
      zoom: param.zoom,
      description: param.description,
      used: param.used,
    };
    return this.commonApi.post('/address/create', body) as Observable<any>;
  }

  // Car
  carList(param: PaginationContext): Observable<any> {
    return this.commonApi.get(
      '/car/list?limit=' + param.limit + '&page=' + param.page + '&search=' + param.search
    ) as Observable<any>;
  }

  carEdit(param: CarModel): Observable<any> {
    const body = {
      car_id: param.car_id,
      number_plat: param.number_plat,
      car_number: param.car_number,
      name: param.name,
      photo: param.photo,
    };
    return this.commonApi.put('/car/update', body) as Observable<any>;
  }

  carCreate(param: CarModel): Observable<any> {
    const body = {
      number_plat: param.number_plat,
      car_number: param.car_number,
      name: param.name,
      photo: param.photo,
    };
    return this.commonApi.post('/car/create', body) as Observable<any>;
  }
}
