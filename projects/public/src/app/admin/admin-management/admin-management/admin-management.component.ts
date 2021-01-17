import { Component, OnInit } from '@angular/core';
import {AdminService} from '../../../services/admin/admin.service';
import {LoadingService} from '../../../services/loading/loading.service';
import {Observable} from 'rxjs';
import {FormControl, Validators} from '@angular/forms';

@Component({
  selector: 'app-admin-management',
  templateUrl: './admin-management.component.html',
  styleUrls: ['./admin-management.component.scss']
})
export class AdminManagementComponent implements OnInit {
  readonly loading$: Observable<boolean>;
  readonly emailAddress = new FormControl('', Validators.email);

  async makeAdmin(): Promise<void> {
    if (this.emailAddress.invalid || await this.loadingService.loading()) return;
    this.loadingService.startLoading();
    this.adminService.makeAdmin$(this.emailAddress.value).subscribe({
      complete: this.loadingService.stopLoading,
      error: this.loadingService.stopLoading
    });
  }

  async removeAdmin(): Promise<void> {
    if (this.emailAddress.invalid || await this.loadingService.loading()) return;
    this.loadingService.startLoading();
    this.adminService.removeAdmin$(this.emailAddress.value).subscribe({
      complete: this.loadingService.stopLoading,
      error: this.loadingService.stopLoading
    });
  }

  constructor(
    private readonly adminService: AdminService,
    private readonly loadingService: LoadingService
  ) {
    this.loading$ = this.loadingService.loading$;
  }

  ngOnInit(): void {
  }

}
