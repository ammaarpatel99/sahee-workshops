import { Component, OnInit } from '@angular/core';
import {AdminService} from '../../../services/admin/admin.service';

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
    private adminService: AdminService
  ) { }

  ngOnInit(): void {
  }

}
