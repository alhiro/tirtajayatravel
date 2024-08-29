export class CustomerContext {
  limit: any;
  page: any;
  search: any;
  customer_id!: number;
}

export class CustomerIdContext {
  customer_id!: number;
}

export class CustomerModel {
  customer_id!: number;
  business_id!: number;
  company_id!: number;
  name!: string;
  telp!: string;
  admin!: string;
  address!: string;
  status!: string;
  createdAt!: Date;
  updatedAt!: Date;

  setCustomer(_category: unknown) {
    const car = _category as CustomerModel;
    this.customer_id = car.customer_id;
    this.business_id = car.business_id;
    this.company_id = car.company_id;
    this.name = car.name || '';
    this.telp = car.telp || '';
    this.admin = car.admin || '';
    this.address = car.address || '';
    this.status = car.status || '';
    this.createdAt = car.createdAt;
    this.updatedAt = car.updatedAt;
  }
}
