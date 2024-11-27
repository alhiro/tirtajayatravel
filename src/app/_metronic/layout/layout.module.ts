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
import { PrintdepositComponent } from '@app/pages/finance/deposit/printdeposit/printdeposit.component';
import { PrintcommissionComponent } from '@app/pages/finance/commission/printcommission/printcommission.component';
import { PrintpiutangComponent } from '@app/pages/finance/piutang/printpiutang/printpiutang.component';
import { PrintrecapitulationComponent } from '@app/pages/finance/recapitulation/printrecapitulation/printrecapitulation.component';
import { PrintPassengerComponent } from '@app/pages/booking/passenger/printPassenger/printPassenger.component';

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
  {
    path: 'booking/package/transaction/printlistuser',
    component: PrintListPackageComponent,
    loadChildren: () => import('../../pages/booking/package/printList/printList.module').then((m) => m.PrintListModule),
  },
  {
    path: 'finance/commission/package/printbayartujuan',
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
  {
    path: 'booking/passenger/transaction/printpassenger',
    component: PrintPassengerComponent,
    loadChildren: () =>
      import('../../pages/booking/passenger/printPassenger/printPassenger.module').then((m) => m.PrintPassengerModule),
  },
  // Print Delivery Daily
  {
    path: 'booking/departure/delivery/printsp',
    component: PrintspComponent,
    loadChildren: () => import('../../pages/booking/delivery/printsp/printsp.module').then((m) => m.PrintspModule),
  },
  // Print Delivery Ticket Passenger
  {
    path: 'booking/departure/delivery/print-ticket',
    component: PrintspComponent,
    loadChildren: () => import('../../pages/booking/delivery/printsp/printsp.module').then((m) => m.PrintspModule),
  },
  // Print BSD
  {
    path: 'finance/bsd/tirta-jaya/printbsd',
    component: PrintbsdComponent,
    loadChildren: () => import('../../pages/finance/bsd/printbsd/printbsd.module').then((m) => m.PrintbsdModule),
  },
  // print deposit daily
  {
    path: 'finance/deposit/daily/printdaily',
    component: PrintdepositComponent,
    loadChildren: () =>
      import('../../pages/finance/deposit/printdeposit/printdeposit.module').then((m) => m.PrintDepositModule),
  },
  {
    path: 'finance/deposit/daily/printdailysby',
    component: PrintdepositComponent,
    loadChildren: () =>
      import('../../pages/finance/deposit/printdeposit/printdeposit.module').then((m) => m.PrintDepositModule),
  },
  // print commission
  {
    path: 'finance/commission/package/printcommission',
    component: PrintcommissionComponent,
    loadChildren: () =>
      import('../../pages/finance/commission/printcommission/printcommission.module').then(
        (m) => m.PrintCommissionModule
      ),
  },
  {
    path: 'finance/commission/package/printmonthly',
    component: PrintcommissionComponent,
    loadChildren: () =>
      import('../../pages/finance/commission/printcommission/printcommission.module').then(
        (m) => m.PrintCommissionModule
      ),
  },
  // print piutang
  {
    path: 'finance/piutang/bill/printpiutang',
    component: PrintpiutangComponent,
    loadChildren: () =>
      import('../../pages/finance/piutang/printpiutang/printpiutang.module').then((m) => m.PrintPiutangModule),
  },
  // print recapitulation
  {
    path: 'finance/recapitulation/deposit/printrecapitulation',
    component: PrintrecapitulationComponent,
    loadChildren: () =>
      import('../../pages/finance/recapitulation/printrecapitulation/printrecapitulation.module').then(
        (m) => m.PrintrecapitulationModule
      ),
  },
  // print recapitulation piutang
  {
    path: 'finance/recapitulation/deposit/printpiutang',
    component: PrintrecapitulationComponent,
    loadChildren: () =>
      import('../../pages/finance/recapitulation/printrecapitulation/printrecapitulation.module').then(
        (m) => m.PrintrecapitulationModule
      ),
  },
  // print recapitulation revenue
  {
    path: 'finance/recapitulation/deposit/printrevenue',
    component: PrintrecapitulationComponent,
    loadChildren: () =>
      import('../../pages/finance/recapitulation/printrecapitulation/printrecapitulation.module').then(
        (m) => m.PrintrecapitulationModule
      ),
  },
  // print recapitulation bsd pnp
  {
    path: 'finance/recapitulation/deposit/printbsdpnp',
    component: PrintrecapitulationComponent,
    loadChildren: () =>
      import('../../pages/finance/recapitulation/printrecapitulation/printrecapitulation.module').then(
        (m) => m.PrintrecapitulationModule
      ),
  },
  // print recapitulation bsd pkt
  {
    path: 'finance/recapitulation/deposit/printbsdpkt',
    component: PrintrecapitulationComponent,
    loadChildren: () =>
      import('../../pages/finance/recapitulation/printrecapitulation/printrecapitulation.module').then(
        (m) => m.PrintrecapitulationModule
      ),
  },
  // print recapitulation bbm
  {
    path: 'finance/recapitulation/deposit/printbbm',
    component: PrintrecapitulationComponent,
    loadChildren: () =>
      import('../../pages/finance/recapitulation/printrecapitulation/printrecapitulation.module').then(
        (m) => m.PrintrecapitulationModule
      ),
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
