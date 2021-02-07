import { Component, OnInit } from '@angular/core';
import {Observable} from 'rxjs';
import {BreakpointObserver, Breakpoints} from '@angular/cdk/layout';
import {finalize, map, shareReplay} from 'rxjs/operators';
import {FormControl, Validators} from '@angular/forms';
import {RepairService} from './services/repair/repair.service';
import {UserService} from '../services/user/user.service';
import {ManageAdminsService} from './services/manage-admins/manage-admins.service';


@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss']
})
export class SettingsComponent {
  public readonly containerClass$ = this.getContainerClass$();
  public readonly isAdmin$ = this.userService.isAdmin$;

  readonly adminEmail = new FormControl('', [Validators.required, Validators.email]);

  private _restoredAdmins?: string[];
  get restoredAdmins(): string[] | undefined {
    return this._restoredAdmins;
  }

  private _patchedDatabase = false;
  get patchedDatabase(): boolean {
    return this._patchedDatabase;
  }

  private _repairedDatabase = false;
  get repairedDatabase(): boolean {
    return this._repairedDatabase;
  }


  submitAdminEmail(makeAdmin: boolean): Promise<void> {
    if (this.adminEmail.pristine || this.adminEmail.invalid || this.adminEmail.disabled) {
      throw new Error(`Can't change admin privileges.`);
    }
    return (
      makeAdmin ?
        this.manageAdminsService.makeAdmin$
        : this.manageAdminsService.removeAdmin$
    )(this.adminEmail.value)
      .pipe(
        map(() => this.adminEmail.reset())
      ).toPromise();
  }


  restoreCoreAdmins(): Promise<void> {
    if (this._restoredAdmins) {
      throw new Error(`Have already restored admins.`);
    }
    this._restoredAdmins = [];
    return this.repairService
      .restoreAdmins$()
      .toPromise()
      .then(restoredAdmins => {
        this._restoredAdmins = restoredAdmins;
      })
      .catch(e => {
        this._restoredAdmins = undefined;
        throw e;
      });
  }


  patchDatabase(): void  {
    if (this.patchedDatabase) {
      throw new Error(`Already have patched database.`);
    }
    // TODO: implement
    this._patchedDatabase = true;
  }


  repairDatabase(): void  {
    if (this.repairedDatabase) {
      throw new Error(`Already repaired database.`);
    }
    // TODO: implement
    this._repairedDatabase = true;
  }


  constructor(
    private readonly breakpointObserver: BreakpointObserver,
    private readonly repairService: RepairService,
    private readonly userService: UserService,
    private readonly manageAdminsService: ManageAdminsService
  ) { }


  private getContainerClass$(): Observable<'wide-container' | 'thin-container'> {
    return this.breakpointObserver.observe([Breakpoints.Handset, Breakpoints.Tablet]).pipe(
      map(state => state.matches),
      map(matches => matches ? 'wide-container' : 'thin-container'),
      shareReplay(1)
    );
  }
}
