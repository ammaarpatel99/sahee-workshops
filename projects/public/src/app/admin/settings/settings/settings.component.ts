import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {finalize, map, shareReplay} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {RepairService} from '../../../services/repair/repair.service';
import {UserService} from '../../../services/user/user.service';
import {ManageAdminsService} from '../../../services/manage-admins/manage-admins.service';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent implements OnInit {
  public readonly containerClass$: Observable<'wide-container' | 'thin-container'>;
  public readonly isAdmin$: Observable<boolean | undefined>;
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
    (makeAdmin ? this.manageAdminsService.makeAdmin$ : this.manageAdminsService.removeAdmin$)(this.adminEmail.value).pipe(
      map(() => {
        this.adminEmail.reset();
      })
    ).subscribe();
  }

  restoreCoreAdmins(): void {
    this.repairService.restoreAdmins$().pipe(
      map(admins => {
        this._restoredAdmins = admins;
      })
    ).subscribe();
  }

  patchDatabase(): void  {
    // TODO: implement
    this._patchedDatabase = true;
  }

  repairDatabase(): void  {
    // TODO: implement
    this._repairedDatabase = true;
  }

  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly repairService: RepairService,
    private readonly adminService: UserService,
    private readonly manageAdminsService: ManageAdminsService
  ) {
    this.containerClass$ = this.getContainerClass$();
    this.isAdmin$ = this.adminService.isAdmin$;
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
