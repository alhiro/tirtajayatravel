import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { InlineSVGModule } from 'ng-inline-svg-2';
import { RouterModule, Routes } from '@angular/router';
import { NgbDropdownModule, NgbProgressbarModule, NgbTooltipModule } from '@ng-bootstrap/ng-bootstrap';
import { TranslateModule } from '@ngx-translate/core';
import { LayoutComponent } from './layout.component';
import { ExtrasModule } from '../partials/layout/extras/extras.module';
import { HeaderComponent } from './components/header/header.component';
import { ContentComponent } from './components/content/content.component';
import { FooterComponent } from './components/footer/footer.component';
import { ScriptsInitComponent } from './components/scripts-init/scripts-init.component';
import { ToolbarComponent } from './components/toolbar/toolbar.component';
import { TopbarComponent } from './components/topbar/topbar.component';
import { PageTitleComponent } from './components/header/page-title/page-title.component';
import { HeaderMenuComponent } from './components/header/header-menu/header-menu.component';
import { DrawersModule, DropdownMenusModule, EngagesModule, ModalsModule } from '../partials';
import { EngagesComponent } from '../partials/layout/engages/engages.component';
import { ThemeModeModule } from '../partials/layout/theme-mode-switcher/theme-mode.module';
import { SidebarComponent } from './components/sidebar/sidebar.component';
import { SidebarLogoComponent } from './components/sidebar/sidebar-logo/sidebar-logo.component';
import { SidebarMenuComponent } from './components/sidebar/sidebar-menu/sidebar-menu.component';
import { SidebarFooterComponent } from './components/sidebar/sidebar-footer/sidebar-footer.component';
import { NavbarComponent } from './components/header/navbar/navbar.component';
import { AccountingComponent } from './components/toolbar/accounting/accounting.component';
import { ClassicComponent } from './components/toolbar/classic/classic.component';
import { ExtendedComponent } from './components/toolbar/extended/extended.component';
import { ReportsComponent } from './components/toolbar/reports/reports.component';
import { SaasComponent } from './components/toolbar/saas/saas.component';
import { SharedModule } from '../shared/shared.module';
import { Routing } from '@app/pages/routing';
import { PrintspComponent } from '@app/pages/booking/delivery/printsp/printsp.component';
import { PrintbsdComponent } from '@app/pages/finance/bsd/printbsd/printbsd.component';
import { PrintPackageComponent } from '@app/pages/booking/package/printPackage/printPackage.component';
import { PrintListPackageComponent } from '@app/pages/booking/package/printList/printList.component';
import { PrintListPassengerComponent } from '@app/pages/booking/passenger/printList/printList.component';

const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: Routing,
  },
  // Print Package
  {
    path: 'booking/package/transaction/printpackage',
    component: PrintPackageComponent,
    loadChildren: () =>
      import('../../pages/booking/package/printPackage/printPackage.module').then((m) => m.PrintPackageModule),
  },
  {
    path: 'booking/package/transaction/printlist',
    component: PrintListPackageComponent,
    loadChildren: () => import('../../pages/booking/package/printList/printList.module').then((m) => m.PrintListModule),
  },
  // Print Passenger
  {
    path: 'booking/passenger/transaction/printlist',
    component: PrintListPassengerComponent,
    loadChildren: () =>
      import('../../pages/booking/passenger/printList/printList.module').then((m) => m.PrintListModule),
  },
  // Print Delivery Daily
  {
    path: 'booking/departure/delivery/printsp',
    component: PrintspComponent,
    loadChildren: () => import('../../pages/booking/delivery/printsp/printsp.module').then((m) => m.PrintspModule),
  },
  // Print BSD
  {
    path: 'finance/bsd/tirta-jaya/printbsd',
    component: PrintbsdComponent,
    loadChildren: () => import('../../pages/finance/bsd/printbsd/printbsd.module').then((m) => m.PrintbsdModule),
  },
];

@NgModule({
  declarations: [
    LayoutComponent,
    HeaderComponent,
    ContentComponent,
    FooterComponent,
    ScriptsInitComponent,
    ToolbarComponent,
    TopbarComponent,
    PageTitleComponent,
    HeaderMenuComponent,
    EngagesComponent,
    SidebarComponent,
    SidebarLogoComponent,
    SidebarMenuComponent,
    SidebarFooterComponent,
    NavbarComponent,
    AccountingComponent,
    ClassicComponent,
    ExtendedComponent,
    ReportsComponent,
    SaasComponent,
  ],
  imports: [
    CommonModule,
    RouterModule.forChild(routes),
    InlineSVGModule,
    NgbDropdownModule,
    NgbProgressbarModule,
    ExtrasModule,
    ModalsModule,
    DrawersModule,
    EngagesModule,
    DropdownMenusModule,
    NgbTooltipModule,
    TranslateModule,
    ThemeModeModule,
    SharedModule,
  ],
  exports: [RouterModule],
})
export class LayoutModule {}
