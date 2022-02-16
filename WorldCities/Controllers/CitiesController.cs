using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.AspNetCore.Authorization;

using WorldCities.Data;
using WorldCities.Data.DTO;
using WorldCities.Data.Models;

namespace WorldCities.Controllers
{
    
    [ApiController]
    [Route("api/[controller]")]
    public class CitiesController : ControllerBase
    {
        private readonly ApplicationDbContext _context;

        public ILogger<CitiesController>? Logger { get; set; } = null;

        public CitiesController(ApplicationDbContext context, ILogger<CitiesController>? logger = null)
        {
            _context = context;
            if (logger != null) {
                Logger = logger;
                //Logger.LogInformation("City Controller logger initialized");
            }
        }

        // GET: api/cities
        // GET: api/cities?pageIndex=0&pageSize=10&sortColumn=name&sortOrder=asc&filterColumn=name&filterQuery=text
        [HttpGet]
        public async Task<ActionResult<ApiResult<CityDTO>>> GetCities(
            [FromQuery]int pageIndex = 0, 
            [FromQuery]int pageSize = 10, 
            [FromQuery]string? sortColumn = null, 
            [FromQuery]string? sortOrder = null,
            [FromQuery]string? filterColumn = null,
            [FromQuery]string? filterQuery = null
        )
        {
            if (_context.Cities == null) 
                return BadRequest("Can't access City Database!");
            
            return await ApiResult<CityDTO>.CreateAsync(_context.Cities.Select(c => new CityDTO()
                {
                    Id = c.Id,
                    Name = c.Name,
                    Lat = c.Lat,
                    Lon = c.Lon,
                    CountryId = c.Country != null ? c.Country.Id : 0,
                    CountryName = c.Country != null ? c.Country.Name : ""
                }), 
                pageIndex, 
                pageSize, 
                sortColumn, 
                sortOrder,
                filterColumn,
                filterQuery);
        }

        // GET: api/cities/5
        [HttpGet]
        [Route("{id}")]
        public async Task<ActionResult<City>> GetCity([FromRoute] int id)
        {
            if (_context.Cities == null) 
                return BadRequest("Can't access City Database!");

            var city = await _context.Cities.FindAsync(id);

            if (city == null)
            {
                return NotFound();
            }

            return city;
        }

        // PUT: api/cities/5
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize]
        [HttpPut("{id}")]
        public async Task<IActionResult> PutCity([FromRoute] int id, [FromBody] City city)
        {
            if (_context.Cities == null) 
                return BadRequest("Can't access City Database!");

            if (id != city.Id)
            {
                return BadRequest();
            }

            _context.Entry(city).State = EntityState.Modified;

            try
            {
                await _context.SaveChangesAsync();
            }
            catch (DbUpdateConcurrencyException)
            {
                if (!(await _context.Cities.AnyAsync(e => e.Id == id)))
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

        // POST: api/cities
        // To protect from overposting attacks, see https://go.microsoft.com/fwlink/?linkid=2123754
        [Authorize]
        [HttpPost]
        public async Task<ActionResult<City>> PostCity([FromBody] City city)
        {
            if (_context.Cities == null) 
                return BadRequest("Can't access City Database!");

            _context.Cities.Add(city);
            await _context.SaveChangesAsync();

            return CreatedAtAction("GetCity", new { id = city.Id }, city);
        }

        [HttpPost]
        [Route("IsDupeCity")]
        public bool? IsDupeCity([FromBody] City city)
        {
            if (_context.Cities == null) 
                return null;
            return _context.Cities.Any(
                e => e.Name == city.Name
                && e.Lat == city.Lat
                && e.Lon == city.Lon
                && e.CountryId == city.CountryId
                && e.Id != city.Id
            );
         }

        // DELETE: api/cities/5
        [Authorize]
        [HttpDelete("{id}")]
        public async Task<ActionResult<City>> DeleteCity(int id)
        {
            if (_context.Cities == null) 
                return BadRequest("Can't access City Database!");

            var city = await _context.Cities.FindAsync(id);
            if (city == null)
            {
                return NotFound();
            }

            _context.Cities.Remove(city);
            await _context.SaveChangesAsync();

            return NoContent();
        }
    }
}
