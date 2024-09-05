import { Routes } from '@angular/router';

const Routing: Routes = [
  {
    path: 'home',
    loadChildren: () => import('./home/home.module').then((m) => m.HomeModule),
  },
  {
    path: 'about',
    loadChildren: () => import('./about/about.module').then((m) => m.AboutModule),
  },
  {
    path: 'builder',
    loadChildren: () => import('./builder/builder.module').then((m) => m.BuilderModule),
  },

  // Booking
  {
    path: 'package/transaction',
    loadChildren: () => import('./booking/package/package.module').then((m) => m.PackageModule),
  },
  {
    path: 'passenger/transaction',
    loadChildren: () => import('./booking/passenger/passenger.module').then((m) => m.PassengerModule),
  },
  {
    path: 'departure/delivery',
    loadChildren: () => import('./booking/delivery/delivery.module').then((m) => m.DeliveryModule),
  },

  // Finance
  {
    path: 'finance/bsd/tirta-jaya',
    loadChildren: () => import('./finance/bsd/bsd.module').then((m) => m.BsdModule),
  },
  {
    path: 'finance/deposit/daily',
    loadChildren: () => import('./finance/deposit/deposit.module').then((m) => m.DepositModule),
  },
  {
    path: 'finance/cash-out/list',
    loadChildren: () => import('./finance/cashout/cashout.module').then((m) => m.CashoutModule),
  },
  {
    path: 'finance/recapitulation-finance/deposit',
    loadChildren: () => import('./finance/recapitulation/recapitulation.module').then((m) => m.RecapitulationModule),
  },
  {
    path: 'finance/commission/package',
    loadChildren: () => import('./finance/commission/commission.module').then((m) => m.CommissionModule),
  },

  // Garage
  {
    path: 'garage/schedule',
    loadChildren: () => import('./garage/schedule/schedule.module').then((m) => m.ScheduleModule),
  },

  // Master
  {
    path: 'master/category',
    loadChildren: () => import('./master/category/category.module').then((m) => m.CategoryModule),
  },
  {
    path: 'master/sub-category',
    loadChildren: () => import('./master/sub-category/sub-category.module').then((m) => m.SubCategoryModule),
  },
  {
    path: 'master/employee',
    loadChildren: () => import('./master/employee/employee.module').then((m) => m.EmployeeModule),
  },
  {
    path: 'master/customer',
    loadChildren: () => import('./master/customer/customer.module').then((m) => m.CustomerModule),
  },
  {
    path: 'master/car',
    loadChildren: () => import('./master/car/car.module').then((m) => m.CarModule),
  },
  {
    path: '',
    redirectTo: '/home',
    pathMatch: 'full',
  },
  {
    path: '**',
    redirectTo: 'error/404',
  },
];

export { Routing };
