using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;
using System.Linq.Dynamic.Core;

using WorldCities.Data;
using WorldCities.Data.Models;
using WorldCities.Data.DTO;


namespace WorldCities.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class CountriesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        public ILogger<CountriesController>? Logger { get; set; } = null;

        public CountriesController(ApplicationDbContext context, ILogger<CountriesController>? logger = null)
        {
            _context = context;
            if (logger != null) {
                Logger = logger;
                //Logger.LogInformation("City Controller logger initialized");
            }
        }

        // GET: api/countries
        // GET: api/countries?pageIndex=0&pageSize=10&sortColumn=name&sortOrder=asc&filterColumn=name&filterQuery=
        [HttpGet]
        public async Task<ActionResult<ApiResult<CountryDTO>>> GetCountries(
            [FromQuery]int pageIndex = 0, 
            [FromQuery]int pageSize = 10, 
            [FromQuery]string? sortColumn = null, 
            [FromQuery]string? sortOrder = null,
            [FromQuery]string? filterColumn = null,
            [FromQuery]string? filterQuery = null
        )
        {
            if (_context.Countries == null) 
                return BadRequest("Can't access Country Database!");
            
            return await ApiResult<CountryDTO>.CreateAsync(_context.Countries.Select(c => new CountryDTO()
                {
                    Id = c.Id,
                    Name = c.Name,
                    ISO2 = c.ISO2,
                    ISO3 = c.ISO3,
                    TotCities = c.Cities.Count
                }),
                pageIndex, 
                pageSize, 
                sortColumn, 
                sortOrder,
                filterColumn,
                filterQuery);
        }

        // GET: api/Countries/5
        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<Country>> GetCountry([FromRoute] int id)
        {
            if (_context.Countries == null) 
                return BadRequest("Can't access Contries Database!");

            var country = await _context.Countries.FindAsync(id);

            if (country == null)
            {
                return NotFound();
            }

            return country;
        }

        // PUT: api/Countries/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCountry([FromRoute] int id, [FromBody] Country country)
        {
            if (_context.Countries == null) 
                return BadRequest("Can't access Contries Database!");

            if (id != country.Id)
            {
                return BadRequest();
            }

            _context.Entry(country).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!(await _context.Countries.AnyAsync(e => e.Id == id)))
                {
                    return NotFound();
                }
                else
                {
                    throw;
                }
            }

            return NoContent();
        }
        [HttpPost]
        [Route("IsDupeField")]
        public bool IsDupeField([FromQuery]int countryId, [FromQuery]string fieldName, [FromQuery]string fieldValue)
        {
            //Console.WriteLine("countryId: " + countryId + ", countryId: " + fieldName + ", fieldValue: " + fieldValue);
            if (_context.Countries != null)
            {
                //using dynamic core library, has reflection overhead (Drier code though)
                return (ApiResult<Country>.IsValidProperty(fieldName, true)) 
                    ? _context.Countries.Any(string.Format("{0} == @0 && Id != @1", fieldName), fieldValue, countryId)
                    : false;
                    
                /*switch (fieldName) //Standard no overhead switching method
                {
                    case "name":
                        return _context.Countries.Any(c => c.Name == fieldValue && c.Id != countryId);
                    case "iso2":
                        return _context.Countries.Any(c => c.ISO2 == fieldValue && c.Id != countryId);
                    case "iso3":
                        return _context.Countries.Any(c => c.ISO3 == fieldValue && c.Id != countryId);
                    default:
                        return false;
                }*/
            }
            return true;
        }


        // POST: api/Countries
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<Country>> PostCountry([FromBody] Country country)
        {
            if (_context.Countries == null) 
                return BadRequest("Can't access Contries Database!");

            _context.Countries.Add(country);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCountry", new { id = country.Id }, country);
        }

        // DELETE: api/Countries/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<Country>> DeleteCountry([FromRoute] int id)
        {
            if (_context.Countries == null) 
                return BadRequest("Can't access Contries Database!");

            var country = await _context.Countries.FindAsync(id);
            if (country == null)
            {
                return NotFound();
            }

            _context.Countries.Remove(country);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
