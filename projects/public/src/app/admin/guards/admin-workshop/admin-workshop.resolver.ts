import { Injectable } from '@angular/core';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {AdminWorkshop} from '@firebase-helpers';
import {AdminWorkshopsService} from '../../services/admin-workshops/admin-workshops.service';
import {GeneralWorkshopResolver} from '../../../helpers/workshop-resolver/general-workshop-resolver';


@Injectable({
  providedIn: 'root'
})
export class AdminWorkshopResolver
  extends GeneralWorkshopResolver<AdminWorkshopsService, AdminWorkshop>
  implements Resolve< Observable<Readonly<AdminWorkshop>> > { }
