import { waitForAsync, ComponentFixture, TestBed, async } from '@angular/core/testing';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RouterTestingModule } from '@angular/router/testing';
import { ActivatedRoute, Router } from '@angular/router';

import { of } from 'rxjs';

import { CityEditComponent } from './city-edit.component';
import { City } from '../../services/city-services/city';
import { CityService } from '../../services/city-services/city-service';
import { ApiResult } from '../../services/api-result';
import { AngularMaterialModule } from '../../angular-material/angular-material.module';
import { Country } from '../../services/country-services/country';
import { By } from '@angular/platform-browser';
import { FormBuilder } from '@angular/forms';



describe('CityEditComponent', () => {
  let component: CityEditComponent;
  let fixture: ComponentFixture<CityEditComponent>;
  const cityName1: string = 'TestCity1';
  const countryNames: string[] = ['TestCountryA', 'TestCountryB', 'TestCountryC'];
  var router: Router;
  var route: ActivatedRoute;
  var fb: FormBuilder;
  // async beforeEach(): TestBed initialization
  beforeEach(async () => {

    // Create a mock cityService object with a mock 'get' method
    const cityService = jasmine.createSpyObj<CityService>(
      'CityService', ['get', 'getCountries', 'isDupeCity']
    );

    // Configure the 'get' spy method
    // return an Observable with some test data
    cityService.get.and.returnValue( of<City>(<City>{ name: cityName1, id: 1, lat: 1, lon: 1, countryId: 1, countryName: countryNames[0] }));

    // Configure the 'getCountries' spy method
    cityService.getCountries.and.returnValue(
      // return an Observable with some test data
      of<ApiResult<Country>>(<ApiResult<Country>>{
        data: [
          <Country> { name: countryNames[0], id: 1, iso2: 'AA', iso3: 'AAA', totCities:1 },
          <Country> { name: countryNames[1], id: 2, iso2: 'BB', iso3: 'BBB', totCities:2 },
          <Country> { name: countryNames[2], id: 3, iso2: 'CC', iso3: 'CCC', totCities:3 }
        ],
        totalCount: 3,
        pageIndex: 0,
        pageSize: 10
      })
    );

    cityService.isDupeCity.and.returnValue(of<boolean>(false));

    await TestBed.configureTestingModule({
      declarations: [
        CityEditComponent
      ],
      imports: [
        BrowserAnimationsModule,
        AngularMaterialModule,
        RouterTestingModule.withRoutes([]),
      ],
      providers: [
        FormBuilder,
        {
          provide: CityService,
          useValue: cityService
        },
      ]
    })
    .compileComponents();
  });

  beforeEach(() => {
    router = TestBed.inject(Router);
    route = TestBed.inject(ActivatedRoute);
  });

  it('should create a cityEditComponent for City Id = 1 and tittle = Edit - City Name', waitForAsync(() => {
    const spyRoute = spyOn(route.snapshot.paramMap, 'get')
    spyRoute.and.returnValue('1')
    fixture = TestBed.createComponent(CityEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect<any>(component.id).toEqual('1');
    expect(component.city).toBeDefined();
    expect(component.city.name).toEqual(cityName1);
    component.countries?.subscribe(result => expect(result.totalCount).toEqual(3));
    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toEqual('Edit - ' + cityName1);
    // here you can test the functionality which is triggered by the snapshot
    //const nameInput: HTMLElement = fixture.debugElement.query(By.css('#name')).nativeElement;
    //expect(nameInput.innerHTML).toEqual(cityName1);
    //const countryList: HTMLElement = fixture.nativeElement.querySelector('span.mat-checkbox-label');
    //expect(countryList.innerText).toEqual(countryNames[0]);
  }));

  it('should create a cityEditComponent for creating a new City with Id = null and tittle = Create a new City', waitForAsync(() => {
    const spyRoute = spyOn(route.snapshot.paramMap, 'get')
    spyRoute.and.returnValue(null)
    fixture = TestBed.createComponent(CityEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    expect(component).toBeTruthy();
    expect<any>(component.id).toBeNull();
    expect(component.city).toBeDefined();
    expect(component.city.name).toBeUndefined();
    component.countries?.subscribe(result => expect(result.totalCount).toEqual(3));

    const title = fixture.nativeElement.querySelector('h1');
    expect(title.textContent).toEqual('Create a new City');
  }));
});


