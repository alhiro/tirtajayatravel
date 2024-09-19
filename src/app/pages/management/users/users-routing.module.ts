import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { marker } from '@biesbjerg/ngx-translate-extract-marker';

import { UsersComponent } from './users.component';

const routes: Routes = [
  // Module is lazy loaded, see app-routing.module.ts
  { path: '', component: UsersComponent, data: { title: marker('Management Users') } },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
  providers: [],
})
export class usersRoutingModule {}
