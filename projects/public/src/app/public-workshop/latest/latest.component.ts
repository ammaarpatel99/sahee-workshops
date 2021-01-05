import { Component, OnInit } from '@angular/core';
import {WorkshopsService} from '../../services/workshops/workshops.service';
import {filter, map, take} from 'rxjs/operators';
import {Router} from '@angular/router';

@Component({
  selector: 'app-latest',
  templateUrl: './latest.component.html',
  styleUrls: ['./latest.component.scss']
})
export class LatestComponent implements OnInit {

  constructor(
    private workshopsService: WorkshopsService,
    private router: Router
  ) {
    this.workshopsService.workshops$.pipe(
      take(2),
      map((workshops) => {
        if (workshops.length === 0) this.router.navigateByUrl('/unknown');
        else this.router.navigateByUrl(`/${workshops[0].id}`);
      })
    ).subscribe();
  }

  ngOnInit(): void {
  }

}
