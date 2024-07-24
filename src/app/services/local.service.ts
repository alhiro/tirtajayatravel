import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  city = [
    {
      city_id: 1,
      name: 'Malang',
    },
    {
      city_id: 2,
      name: 'Surabaya',
    },
  ];

  position = [
    {
      level_id: 1,
      name: 'Supervisor',
    },
    {
      level_id: 2,
      name: 'Front Office',
    },
    {
      level_id: 3,
      name: 'Kasir',
    },
    {
      level_id: 4,
      name: 'Keuangan',
    },
    {
      level_id: 5,
      name: 'Sopir',
    },
    {
      level_id: 6,
      name: 'Bengkel',
    },
    {
      level_id: 7,
      name: 'Owner',
    },
    {
      level_id: 8,
      name: 'Administrator',
    },
    {
      level_id: 9,
      name: 'Kurir',
    },
  ];

  company = [
    {
      company_id: 1,
      name: 'Perseorangan',
    },
    {
      company_id: 2,
      name: 'Perusahaan',
    },
  ];

  business = [
    {
      business_id: 1,
      name: 'Makanan',
    },
    {
      business_id: 2,
      name: 'Minuman',
    },
    {
      business_id: 3,
      name: 'Elektronik',
    },
    {
      business_id: 4,
      name: 'Dokumen',
    },
  ];

  request = [
    {
      request_id: 1,
      name: '03.00 WIB',
    },
    {
      request_id: 2,
      name: '04.00 WIB',
    },
    {
      request_id: 3,
      name: '05.00 WIB',
    },
    {
      request_id: 4,
      name: '06.00 WIB',
    },
    {
      request_id: 5,
      name: '07.00 WIB',
    },
    {
      request_id: 6,
      name: '08.00 WIB',
    },
    {
      request_id: 7,
      name: '09.00 WIB',
    },
    {
      request_id: 8,
      name: '10.00 WIB',
    },
    {
      request_id: 9,
      name: '11.00 WIB',
    },
    {
      request_id: 10,
      name: '12.00 WIB',
    },
    {
      request_id: 11,
      name: '13.00 WIB',
    },
    {
      request_id: 12,
      name: '14.00 WIB',
    },
    {
      request_id: 13,
      name: '15.00 WIB',
    },
    {
      request_id: 14,
      name: '16.00 WIB',
    },
    {
      request_id: 15,
      name: '17.00 WIB',
    },
    {
      request_id: 16,
      name: '18.00 WIB',
    },
  ];

  status = [
    {
      status_id: 1,
      name: 'Lunas (Kantor)',
    },
    {
      status_id: 2,
      name: 'Lunas (Transfer)',
    },
    {
      status_id: 3,
      name: 'Bayar Tujuan (COD)',
    },
    {
      status_id: 4,
      name: 'Piutang',
    },
    {
      status_id: 5,
      name: 'Customer (Bulanan)',
    },
  ];

  payment = [
    {
      status_id: 1,
      name: 'Bayar Tujuan (CBA)',
    },
    {
      status_id: 2,
      name: 'Lunas (Kantor)',
    },
    {
      status_id: 3,
      name: 'Lunas (Transfer)',
    },
    {
      status_id: 4,
      name: 'Piutang',
    },
  ];

  class = [
    {
      status_id: 1,
      name: 'Biasa',
    },
    {
      status_id: 2,
      name: 'Executif',
    },
    {
      status_id: 3,
      name: 'Paket',
    },
  ];

  statusPackage = [
    {
      status_package_id: 1,
      name: 'Progress',
    },
    {
      status_package_id: 2,
      name: 'Cancel',
    },
    {
      status_package_id: 3,
      name: 'Delivery',
    },
    {
      status_package_id: 4,
      name: 'Complete',
    },
  ];

  statusPassenger = [
    {
      status_package_id: 1,
      name: 'Progress',
    },
    {
      status_package_id: 2,
      name: 'Move',
    },
    {
      status_package_id: 3,
      name: 'Cancel',
    },
    {
      status_package_id: 4,
      name: 'Departure',
    },
    {
      status_package_id: 5,
      name: 'Complete',
    },
  ];

  constructor() {}

  getCity() {
    return this.city;
  }

  getPosition() {
    return this.position;
  }

  getCompany() {
    return this.company;
  }

  getBusiness() {
    return this.business;
  }

  getRequest() {
    return this.request;
  }

  getStatus() {
    return this.status;
  }

  getPayment() {
    return this.payment;
  }

  getClass() {
    return this.class;
  }

  getStatusPackage() {
    return this.statusPackage;
  }

  getStatusPassenger() {
    return this.statusPassenger;
  }
}
