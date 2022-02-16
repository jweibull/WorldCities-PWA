using Microsoft.AspNetCore.Mvc;
using ClosedXML.Excel;
using Microsoft.EntityFrameworkCore;
using System.Security;
using Microsoft.AspNetCore.Identity;
using WorldCities.Data.Models;
using WorldCities.Data;

namespace WorldCities.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController]
    public class SeedController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly IWebHostEnvironment _env;
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;

        public SeedController(
            ApplicationDbContext context, 
            IWebHostEnvironment env,
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager)
        {
            _context = context;
            _env = env;
            _roleManager = roleManager;
            _userManager = userManager;
        }

        [HttpGet]
        public async Task<IActionResult> Import()
        {
            // prevents non-development environments from running this method
            if (!_env.IsDevelopment())
                throw new SecurityException("Not allowed");

            var path = Path.Combine(
                _env.ContentRootPath,
                "Data/Source/worldcities.xlsx");

            using var stream = System.IO.File.OpenRead(path);
            using var wbook = new XLWorkbook(stream);


            // get the first worksheet 
            var worksheet = wbook.Worksheet(1); 

            // initialize the record counters 
            var numberOfCountriesAdded = 0;
            var numberOfCitiesAdded = 0;

            // check if DbSets are not null;
            if (_context.Countries == null || _context.Cities == null)
                return BadRequest();

            // create a lookup dictionary
            // containing all the countries already existing 
            // into the Database (it will be empty on first run).
                        
            var countriesByName = _context.Countries
                .AsNoTracking()
                .ToDictionary(x => x.Name, StringComparer.OrdinalIgnoreCase);
            
            var nRow = 2;
            var row = worksheet.Row(nRow);
            // iterates through all rows, skipping the first one 
            while(!row.IsEmpty())
            {
                var countryName = row.Cell(5).GetValue<string>();
                var iso2 = row.Cell(6).GetValue<string>();
                var iso3 = row.Cell(7).GetValue<string>();

                // skip this country if it already exists in the database
                if (countriesByName.ContainsKey(countryName))
                {
                    row = worksheet.Row(++nRow);
                    continue;
                }
                // create the Country entity and fill it with xlsx data 
                var country = new Country
                {
                    Name = countryName,
                    ISO2 = iso2,
                    ISO3 = iso3
                };

                // add the new country to the DB context 
                await _context.Countries.AddAsync(country);

                // store the country in our lookup to retrieve its Id later on
                countriesByName.Add(countryName, country);

                // increment the counter 
                numberOfCountriesAdded++;

                row = worksheet.Row(++nRow);
            }

            // save all the countries into the Database 
            if (numberOfCountriesAdded > 0) await _context.SaveChangesAsync();

            // create a lookup dictionary 
            // containing all the cities already existing 
            // into the Database (it will be empty on first run). 
            var cities = _context.Cities
                .AsNoTracking()
                .ToDictionary(x => (
                    Name: x.Name,
                    Lat: x.Lat,
                    Lon: x.Lon,
                    CountryId: x.CountryId));

            nRow = 2;
            row = worksheet.Row(nRow);
            // iterates through all rows, skipping the first one 
            while(!row.IsEmpty())
            {
                var name = row.Cell(1).GetValue<string>();
                var nameAscii = row.Cell(2).GetValue<string>();
                var lat = row.Cell(3).GetValue<decimal>();
                var lon = row.Cell(4).GetValue<decimal>();
                var countryName = row.Cell(5).GetValue<string>();

                // retrieve country Id by countryName
                var countryId = countriesByName[countryName].Id;

                // skip this city if it already exists in the database
                if (cities.ContainsKey((
                    Name: name,
                    Lat: lat,
                    Lon: lon,
                    CountryId: countryId)))
                {
                    row = worksheet.Row(++nRow);
                    continue;
                }
                // create the City entity and fill it with xlsx data 
                var city = new City
                {
                    Name = name,
                    Name_ASCII = nameAscii,
                    Lat = lat,
                    Lon = lon,
                    CountryId = countryId
                };

                // add the new city to the DB context 
                _context.Cities.Add(city);

                // increment the counter 
                numberOfCitiesAdded++;

                row = worksheet.Row(++nRow);
            }

            // save all the cities into the Database 
            if (numberOfCitiesAdded > 0) await _context.SaveChangesAsync();

            return new JsonResult(new
            {
                Cities = numberOfCitiesAdded,
                Countries = numberOfCountriesAdded
            });
        }

        [HttpGet]
        public async Task<ActionResult> CreateDefaultUsers()
        {
            // setup the default role names
            string role_RegisteredUser = "RegisteredUser";
            string role_Administrator = "Administrator";
            // create the default roles (if they don't exist yet)
            if (await _roleManager.FindByNameAsync(role_RegisteredUser) == null)
                await _roleManager.CreateAsync(new IdentityRole(role_RegisteredUser));
            if (await _roleManager.FindByNameAsync(role_Administrator) == null)
                await _roleManager.CreateAsync(new IdentityRole(role_Administrator));
            // create a list to track the newly added users
            var addedUserList = new List<ApplicationUser>();
            // check if the admin user already exists
            var email_Admin = "admin@email.com";
            if (await _userManager.FindByNameAsync(email_Admin) == null)
            {
                var now = DateTime.Now;
                // create a new admin ApplicationUser account
                var user_Admin = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_Admin,
                    Email = email_Admin,
                    DisplayName = "Administrator",
                    CreatedDate = now,
                    LastModifiedDate = now
                };
                // insert the admin user into the DB
                await _userManager.CreateAsync(user_Admin, "MySecr3t$");
                // assign the "RegisteredUser" and "Administrator" roles
                await _userManager.AddToRoleAsync(user_Admin, role_RegisteredUser);
                await _userManager.AddToRoleAsync(user_Admin, role_Administrator);
                // confirm the e-mail and remove lockout
                user_Admin.EmailConfirmed = true;
                user_Admin.LockoutEnabled = false;
                // add the admin user to the added users list
                addedUserList.Add(user_Admin);
            }
            // check if the standard user already exists
            var email_User = "user@email.com";
            if (await _userManager.FindByNameAsync(email_User) == null)
            {
                var now = DateTime.Now;
                // create a new standard ApplicationUser account
                var user_User = new ApplicationUser()
                {
                    SecurityStamp = Guid.NewGuid().ToString(),
                    UserName = email_User,
                    Email = email_User,
                    DisplayName = "Seeded User",
                    CreatedDate = now,
                    LastModifiedDate = now
                };
                // insert the standard user into the DB
                await _userManager.CreateAsync(user_User, "MySecr3t$");
                // assign the "RegisteredUser" role
                await _userManager.AddToRoleAsync(user_User, role_RegisteredUser);
                // confirm the e-mail and remove lockout
                user_User.EmailConfirmed = true;
                user_User.LockoutEnabled = false;
                // add the standard user to the added users list
                addedUserList.Add(user_User);
            }

            // if we added at least one user, persist the changes into the DB
            if (addedUserList.Count > 0)
                await _context.SaveChangesAsync();
            return new JsonResult(new
            {
                Count = addedUserList.Count,
                Users = addedUserList
            });
        }
    }
}