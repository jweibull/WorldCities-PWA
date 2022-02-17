import { Component, OnInit } from '@angular/core';
import { AuthorizeService } from '../services/auth-services/authorize.service';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of } from 'rxjs';
import { map } from 'rxjs/operators';



@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  public userLoggedIn!: Observable<boolean>;
  public displayName!: Observable<string | null>;

  constructor(private auth: AuthorizeService, private router: Router) { }

  //Find a way to emit a login type so it doesn't run millions of times the same function

  ngOnInit(): void {
    this.userLoggedIn = this.auth.isLoggedInAsync();
    this.displayName = this.auth.getUser().pipe(map(u => u && u.displayName));
  }

  logout(): boolean {
    // logs out the user, then redirects him to Home View.
    if (this.auth.logout()) {
        this.router.navigate(["/"]);
    }
    return false;
  }
}
