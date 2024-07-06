import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class LocalService {
  membership = [
    {
      id: 0,
      name: 'Unverified',
    },
    {
      id: 1,
      name: 'Rakyat Baru',
    },
    {
      id: 2,
      name: 'Rakyat Lama',
    },
    {
      id: 3,
      name: 'Sultan Baru',
    },
    {
      id: 4,
      name: 'Sultan Lama',
    },
    {
      id: 5,
      name: 'Saudagar Baru',
    },
    {
      id: 6,
      name: 'Saudagar Lama',
    },
    {
      id: 7,
      name: 'Kaisar Baru',
    },
    {
      id: 8,
      name: 'Kaisar Lama',
    },
  ];

  constructor() {}

  getMembership() {
    return this.membership;
  }
}
