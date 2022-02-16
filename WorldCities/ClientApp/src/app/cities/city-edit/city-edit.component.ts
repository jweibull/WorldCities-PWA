import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormGroup, Validators, AbstractControl, AsyncValidatorFn, FormBuilder } from '@angular/forms';
import { Observable, BehaviorSubject } from 'rxjs';
import { map } from 'rxjs/operators';

import { City } from 'src/app/services/city-services/city';
import { Country } from 'src/app/services/country-services/country';
import { CityService } from 'src/app/services/city-services/city-service';
import { ApiResult } from 'src/app/services/api-result';

@Component({
  selector: 'app-city-edit',
  templateUrl: './city-edit.component.html',
  styleUrls: ['./city-edit.component.scss']
})
export class CityEditComponent implements OnInit {

  // the view title
  title: string = "";

  // the form model
  form!: FormGroup;

  // the city object to edit or create
  city: City = <City>{};

  // the city object id, as fetched from the active route:
  // It's NULL when we're adding a new city,
  // and not NULL when we're editing an existing one.
  id?: number | null;

  // the countries observable for the select (using async pipe)
  countries?: Observable<ApiResult<Country>> | null;

  // Notifier subject (to avoid memory leaks)
  loading: BehaviorSubject<boolean> = new BehaviorSubject<boolean>(true);

  constructor(
    private fb: FormBuilder,
    private activatedRoute: ActivatedRoute,
    private router: Router,
    private cityService: CityService) {
  }

  ngOnInit() {
    this.form = this.fb.group({
      name: ['', [Validators.required], null],
      lat: ['', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)], null],
      lon: ['', [Validators.required, Validators.pattern(/^[-]?[0-9]+(\.[0-9]{1,4})?$/)], null],
      countryId: ['', [Validators.required], null]
    });
    this.form.setAsyncValidators(this.isDupeCity());
    this.loading.next(true);
    this.loadData();
  }

  hasLoaded() {
    this.loading.next(false);
  }

  loadData() {
    // load countries
    this.loadCountries();

    // retrieve the ID from the 'id'
    this.id= this.activatedRoute.snapshot.paramMap.get('id') as (number | null);
    if (this.id) {
      // EDIT MODE
      // fetch the city from the server
      this.cityService.get<City>(this.id).subscribe({
        next: result => {
          this.city = result;
          this.title = "Edit - " + this.city.name;
          // update the form with the city value
          this.form.patchValue(this.city);
        },
        error: err => console.error(err)
      });
    }
    else {
      // ADD NEW MODE

      this.title = "Create a new City";
    }
  }

  loadCountries() {
    // fetch all the countries from the server
    this.countries = this.cityService.getCountries<ApiResult<Country>>(0, 9999, "name", "ASC");
  }

  onSubmit() {
    var city = (this.id) ? this.city : <City>{};

    city.name = this.form.get("name")?.value;
    city.lat = +this.form.get("lat")?.value;
    city.lon = +this.form.get("lon")?.value;
    city.countryId = +this.form.get("countryId")?.value;

    if (this.id) {
      // EDIT mode
      this.cityService.put<City>(city).subscribe({
        next: () => {

        //console.log("City " + city.id + " has been updated.");

        // go back to cities view
        this.router.navigate(['/cities']);
        },
        error: err => {
          console.error(err);
        }
      });
    }
    else {
      // ADD NEW mode
      this.cityService.post<City>(city).subscribe({
        next:result => {

          //console.log("City " + result.id + " has been created.");

          // go back to cities view
          this.router.navigate(['/cities']);
        },
        error: err => console.error(err)
      });
    }
  }

  isDupeCity(): AsyncValidatorFn {
    return (control: AbstractControl): Observable<{ [key: string]: any } | null> => {
      var city = <City>{};
      city.id = (this.id) ? this.id : 0;
      city.name = this.form.get("name")?.value;
      city.lat = +this.form.get("lat")?.value;
      city.lon = +this.form.get("lon")?.value;
      city.countryId = +this.form.get("countryId")?.value;

      return this.cityService.isDupeCity(city).pipe(map(result => {
        return (result ? { isDupeCity: true } : null);
      }));
    }
  }

  log(str: string) {
    console.log("[" + new Date().toLocaleString() + "] " + str + "<br />");
  }
}
