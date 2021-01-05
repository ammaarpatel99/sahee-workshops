import { Component, OnInit } from '@angular/core';
import {AdminService} from '../../../services/admin/admin.service';
import {AngularFireAuth} from '@angular/fire/auth';
import {map, take} from 'rxjs/operators';

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.scss']
})
export class AdminManagementComponent implements OnInit {
  uid = '';
  restoreCoreAdmins(): void {
    this.adminService.restoreAdmins$().subscribe();
  }
  makeAdmin(): void {
    this.adminService.makeAdmin$(this.uid).subscribe();
  }
  removeAdmin(): void {
    this.adminService.removeAdmin$(this.uid).subscribe();
  }

  constructor(
    private adminService: AdminService,
    private auth: AngularFireAuth
  ) {
    this.auth.user.pipe(
      take(1),
      map(user => user ? user.getIdTokenResult().then(token => console.log(token.claims)) : undefined)
    ).subscribe();
  }

  ngOnInit(): void {
  }

}
