export class VendorModel {
  vendor_garage_id!: Number;
  car_id!: Number;
  name!: string;
  type!: string;
  address!: string;
  telp!: string;
  status!: string;
  description!: string;
  updated_by!: string;
  created_by!: string;

  setVendor(_schedule: unknown) {
    const vendor = _schedule as VendorModel;
    this.vendor_garage_id = vendor.vendor_garage_id;
    this.car_id = vendor.car_id;
    this.name = vendor.name;
    this.type = vendor.type;
    this.address = vendor.address;
    this.telp = vendor.telp;
    this.status = vendor.status;
    this.description = vendor.description;
    this.updated_by = vendor.updated_by;
    this.created_by = vendor.created_by;
  }
}
