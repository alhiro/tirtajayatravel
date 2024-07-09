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

  constructor() {}

  getCity() {
    return this.city;
  }

  getPosition() {
    return this.position;
  }
}
