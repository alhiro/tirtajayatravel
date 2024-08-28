import { CustomerModel } from './customer.model';

export class AddressModel {
  address_id!: number;
  customer_id!: number;
  customer!: CustomerModel;
  name!: string;
  address!: string;
  telp!: string;
  default!: boolean;
  longitude!: any;
  latitude!: any;
  zoom!: any;
  description!: string;
  used!: string;

  setAddress(_address: unknown) {
    const address = _address as AddressModel;
    this.address_id = address.address_id;
    this.customer_id = address.customer_id;
    this.name = address.name || '';
    this.address = address.address || '';
    this.telp = address.telp || '';
    this.default = address.default || false;
    this.longitude = address.longitude || '';
    this.latitude = address.latitude || '';
    this.zoom = address.zoom || '';
    this.description = address.description || '';
    this.used = address.used || '';
  }
}
