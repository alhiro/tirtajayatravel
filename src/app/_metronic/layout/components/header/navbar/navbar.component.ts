import { Component, Input, OnInit } from '@angular/core';
import { Utils } from '@app/@shared';

@Component({
  selector: 'app-navbar',
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.scss'],
})
export class NavbarComponent implements OnInit {
  @Input() appHeaderDefaulMenuDisplay!: boolean;
  @Input() isRtl!: boolean;

  levelrule: string = '';
  username!: string;
  initials: string = '';

  itemClass: string = 'ms-1 ms-lg-3';
  btnClass: string =
    'btn btn-icon btn-custom btn-icon-muted btn-active-light btn-active-color-primary w-35px h-35px w-md-40px h-md-40px';
  userAvatarClass: string = 'symbol-35px symbol-md-40px';
  btnIconClass: string = 'fs-2 fs-md-1';

  constructor(private utils: Utils) {
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
}
