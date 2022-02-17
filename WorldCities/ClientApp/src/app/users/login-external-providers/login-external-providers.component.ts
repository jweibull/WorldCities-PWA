import { Component, Inject, OnInit, NgZone, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { HttpClient } from "@angular/common/http";
import { Router } from "@angular/router";
import { AuthorizeService } from 'src/app/services/auth-services/authorize.service';
import { TokenResponse } from '../../services/auth-services/token.response';
import { MatIconRegistry } from '@angular/material/icon';
import { DomSanitizer } from '@angular/platform-browser';

declare var window: any;

@Component({
  selector: 'app-login-external-providers',
  templateUrl: './login-external-providers.component.html',
  styleUrls: ['./login-external-providers.component.scss']
})
export class LoginExternalProvidersComponent implements OnInit {

  externalProviderWindow :any;

  constructor(
      private http: HttpClient,
      private router: Router,
      private authService: AuthorizeService,
      // inject the local zone
      private zone: NgZone,
      @Inject(PLATFORM_ID) private platformId: any,
      private matIconRegistry: MatIconRegistry,
      private domSanitizer: DomSanitizer) {
        this.matIconRegistry.addSvgIcon(
          'googlelogo',
          this.domSanitizer.bypassSecurityTrustResourceUrl('src/assets/img/googlelogo.svg')
        );
  }

  ngOnInit() {
      if (!isPlatformBrowser(this.platformId)) {
          return;
      }

      // close previously opened windows (if any)
      this.closePopUpWindow();

      // instantiate the externalProviderLogin function (if it doesn't exist already)
      var self = this;
      if (!window.externalProviderLogin) {
          window.externalProviderLogin = function (auth: TokenResponse) {
              self.zone.run(() => {
                  console.log("External Login successful!");
                  self.authService.setAuth(auth);
                  self.router.navigate([""]);
              });
          }
      }
  }

  closePopUpWindow() {
      if (this.externalProviderWindow) {
          this.externalProviderWindow.close();
      }
      this.externalProviderWindow = null;
  }

  callExternalLogin(providerName: string) {
      if (!isPlatformBrowser(this.platformId)) {
          return;
      }

      const url = "api/Token/ExternalLogin/" + providerName;
      // minimalistic mobile devices support
      const w = (screen.width >= 1050) ? 1050 : screen.width;
      const h = (screen.height >= 550) ? 550 : screen.height;
      const params = "toolbar=yes,scrollbars=yes,resizable=yes,width=" + w + ", height=" + h;
      // close previously opened windows (if any)
      this.closePopUpWindow();
      this.externalProviderWindow = window.open(url, "ExternalProvider", params, false);
  }
}
