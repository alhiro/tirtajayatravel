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

  // MATER
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
  employeeList(param: PaginationContext): Observable<any> {
    return this.commonApi.get('/employee/list?limit=' + param.limit + '&page=' + param.page) as Observable<any>;
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
  customerList(param: PaginationContext): Observable<any> {
    return this.commonApi.get('/customer/list?limit=' + param.limit + '&page=' + param.page) as Observable<any>;
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
    return this.commonApi.get('/car/list?limit=' + param.limit + '&page=' + param.page) as Observable<any>;
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
