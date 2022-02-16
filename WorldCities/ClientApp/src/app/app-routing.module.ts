import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';
import { CitiesComponent } from './cities/cities.component';
import { CityEditComponent } from './cities/city-edit/city-edit.component';
import { CountriesComponent } from './countries/countries.component';
import { CountryEditComponent } from './countries/country-edit/country-edit.component';
import { LoginComponent } from './users/login/login.component';
import { AuthorizeGuard } from './services/auth-services/authorize.guard';
import { RegisterComponent } from './users/register/register.component';


const routes: Routes = [
  {
    path:"",
    component: HomeComponent
  },
  {
    path:"cities",
    component: CitiesComponent
  },
  {
    path:"city/:id",
    component: CityEditComponent,
    canActivate: [AuthorizeGuard]
  },
  {
    path:"city",
    component: CityEditComponent,
    canActivate: [AuthorizeGuard]
  },
  {
    path:"countries",
    component: CountriesComponent
  },
  {
    path:"country/:id",
    component: CountryEditComponent,
    canActivate: [AuthorizeGuard]
  },
  {
    path:"country",
    component: CountryEditComponent,
    canActivate: [AuthorizeGuard]
  },
  {
    path:"login",
    component: LoginComponent,
  },
  {
    path:"register",
    component: RegisterComponent,
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
