import { Routes, Route } from '@angular/router';

import { AuthenticationGuard } from '@app/modules/auth';
import { ShellComponent } from './shell.component';

/**
 * Provides helper methods to create routes.
 */
export class Shell {
  /**
   * Creates routes using the shell component and authentication.
   * @param routes The routes to add.
   * @return The new route using shell as the base.
   */
  static childRoutes(routes: Routes): Route {
    return {
      path: '',
      component: ShellComponent,
      children: routes,
      canActivate: [AuthenticationGuard],
    };
  }
}
