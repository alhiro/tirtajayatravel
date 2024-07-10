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
