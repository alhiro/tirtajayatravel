import { Component, HostBinding, OnDestroy, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { Utils } from '@app/@shared';
import { AuthenticationService } from '@app/modules/auth';
import { Observable, Subscription } from 'rxjs';

@Component({
  selector: 'app-user-inner',
  templateUrl: './user-inner.component.html',
})
export class UserInnerComponent implements OnInit, OnDestroy {
  @HostBinding('class')
  class = `menu menu-sub menu-sub-dropdown menu-column menu-rounded menu-gray-600 menu-state-bg menu-state-primary fw-bold py-4 fs-6 w-275px`;
  @HostBinding('attr.data-kt-menu') dataKtMenu = 'true';

  langs = languages;
  private unsubscribe: Subscription[] = [];

  levelrule: string = '';
  username!: string;
  initials: string = '';

  constructor(private authenticationService: AuthenticationService, private router: Router, private utils: Utils) {
    const rule = this.utils.getLevel();
    if (rule === 1) {
      this.levelrule = 'Supervisor';
    } else if (rule === 2) {
      this.levelrule = 'Front Office';
    } else if (rule === 3) {
      this.levelrule = 'Cashier';
    } else if (rule === 4) {
      this.levelrule = 'Finance';
    } else if (rule === 5) {
      this.levelrule = 'Driver';
    } else if (rule === 6) {
      this.levelrule = 'Garage';
    } else if (rule === 7) {
      this.levelrule = 'Owner';
    } else if (rule === 8) {
      this.levelrule = 'Administrator';
    } else if (rule === 9) {
      this.levelrule = 'Courier';
    }

    this.username = this.utils.getUsername();
    console.log(this.username);
    this.initials = this.getInitials(this.username);
  }

  ngOnInit(): void {}

  getInitials(name: string): string {
    const parts = name.split(' ');

    if (parts.length > 1) {
      return parts[0][0] + parts[parts.length - 1][0];
    } else if (parts.length > 0 && parts[0].length > 1) {
      return parts[0][0] + parts[0][1];
    } else {
      return 'N/A';
    }
  }

  logout() {
    // document.location.reload();
    this.authenticationService.logout().subscribe(() => this.router.navigate(['/login'], { replaceUrl: true }));
  }

  selectLanguage(lang: string) {
    this.setLanguage(lang);
    // document.location.reload();
  }

  setLanguage(lang: string) {
    this.langs.forEach((language: LanguageFlag) => {
      if (language.lang === lang) {
        language.active = true;
      } else {
        language.active = false;
      }
    });
  }

  ngOnDestroy() {
    this.unsubscribe.forEach((sb) => sb.unsubscribe());
  }
}

interface LanguageFlag {
  lang: string;
  name: string;
  flag: string;
  active?: boolean;
}

const languages = [
  {
    lang: 'en',
    name: 'English',
    flag: './assets/media/flags/united-states.svg',
  },
  {
    lang: 'zh',
    name: 'Mandarin',
    flag: './assets/media/flags/china.svg',
  },
  {
    lang: 'es',
    name: 'Spanish',
    flag: './assets/media/flags/spain.svg',
  },
  {
    lang: 'ja',
    name: 'Japanese',
    flag: './assets/media/flags/japan.svg',
  },
  {
    lang: 'de',
    name: 'German',
    flag: './assets/media/flags/germany.svg',
  },
  {
    lang: 'fr',
    name: 'French',
    flag: './assets/media/flags/france.svg',
  },
];
