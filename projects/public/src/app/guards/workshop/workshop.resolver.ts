import { Injectable } from '@angular/core';
import {Resolve} from '@angular/router';
import {Observable} from 'rxjs';
import {Workshop} from '../../helpers/workshops';
import {UserWorkshopsService} from '../../services/user-workshops/user-workshops.service';
import {GeneralWorkshopResolver} from '../../helpers/workshop-resolver/general-workshop-resolver';


@Injectable({
  providedIn: 'root'
})
export class WorkshopResolver
  extends GeneralWorkshopResolver<UserWorkshopsService, Workshop>
  implements Resolve< Observable<Readonly<Workshop>> > { }
