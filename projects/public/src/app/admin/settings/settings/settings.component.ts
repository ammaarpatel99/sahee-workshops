import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {finalize, map, shareReplay} from 'rxjs/operators';
import {AdminService} from '../../../services/admin/admin.service';
import {FormControl, Validators} from '@angular/forms';
import {LoadingService} from '../../../services/loading/loading.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public readonly containerClass$: Observable<'wide-container' | 'thin-container'>;
  public readonly isAdmin$: Observable<boolean | undefined>;
  public readonly loading$: Observable<boolean>;
  private _restoredAdmins: string[] | null = null;
  private _patchedDatabase = false;
  private _repairedDatabase = false;

  readonly adminEmail = new FormControl('', [Validators.required, Validators.email]);

  get restoredAdmins(): string[] | null {
    return this._restoredAdmins;
  }

  get patchedDatabase(): boolean {
    return this._patchedDatabase;
  }

  get repairedDatabase(): boolean {
    return this._repairedDatabase;
  }

  submitAdminEmail(makeAdmin: boolean): void {
    if (this.adminEmail.pristine || this.adminEmail.invalid || this.adminEmail.disabled) {
      throw new Error(`Can't change admin privileges.`);
    }
    this.loadingService.startLoading();
    (makeAdmin ? this.adminService.makeAdmin$ : this.adminService.removeAdmin$)(this.adminEmail.value).pipe(
      finalize(() => this.loadingService.stopLoading()),
      map(() => {
        this.adminEmail.reset();
      })
    ).subscribe();
  }

  restoreCoreAdmins(): void {
    if (this.loadingService.loading()) throw new Error(`Can't restore core admins.`);
    this.loadingService.startLoading();
    this.adminService.restoreAdmins$().pipe(
      finalize(() => this.loadingService.stopLoading()),
      map(admins => {
        this._restoredAdmins = admins;
      })
    ).subscribe();
  }

  patchDatabase(): void  {
    if (this.loadingService.loading()) throw new Error(`Can't patch database.`);
    // TODO: implement
    this._patchedDatabase = true;
  }

  repairDatabase(): void  {
    if (this.loadingService.loading()) throw new Error(`Can't patch database.`);
    // TODO: implement
    this._repairedDatabase = true;
  }

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly adminService: AdminService,
    private readonly loadingService: LoadingService
  ) {
    this.containerClass$ = this.getContainerClass$();
    this.isAdmin$ = this.adminService.isAdmin$;
    this.loading$ = this.loadingService.loading$;
  }

  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      shareReplay(1)
    );
  }

  ngOnInit(): void {
  }

}
