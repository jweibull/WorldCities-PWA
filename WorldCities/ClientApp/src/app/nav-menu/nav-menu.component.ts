import { Component, OnInit } from '@angular/core';
import { AuthorizeService } from '../services/auth-services/authorize.service';
import { Router } from '@angular/router';
import { Observable } from 'rxjs';



@Component({
  selector: 'app-nav-menu',
  templateUrl: './nav-menu.component.html',
  styleUrls: ['./nav-menu.component.scss']
})
export class NavMenuComponent implements OnInit {

  constructor(private auth: AuthorizeService, private router: Router) { }

  ngOnInit(): void {
  }

  isLoggedIn(): boolean {
    return this.auth.isLoggedIn();
  }

  getUserName(): Observable<string> {
    return this.auth.getUserName();
  }

  getDisplayName(): Observable<string> {
    return this.auth.getDisplayName();
  }

  logout(): boolean {
    // logs out the user, then redirects him to Home View.
    if (this.auth.logout()) {
        this.router.navigate(["/"]);
    }
    return false;
  }
}
