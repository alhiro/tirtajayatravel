import { Component, OnInit } from '@angular/core';
import { Utils } from '@app/@shared';

@Component({
  selector: 'app-sidebar-menu',
  templateUrl: './sidebar-menu.component.html',
  styleUrls: ['./sidebar-menu.component.scss'],
})
export class SidebarMenuComponent implements OnInit {
  username!: string;
  levelrule!: number;

  constructor(private utils: Utils) {
    this.levelrule = this.utils.getLevel();
    this.username = this.utils.getUsername();
  }

  ngOnInit(): void {}
}
