using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;

using WorldCities.Data;
using WorldCities.Data.DTO;
using WorldCities.Data.Models;
//using Mapster;

namespace WorldCities.Controllers
{
    [Route("api/[controller]/[action]")]
    [ApiController] 
    public class UserController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TokenController> _logger; 
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        public UserController(
            ApplicationDbContext context, 
            ILogger<TokenController> logger, 
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
        }

        /// <summary>
        /// PUT: api/user/adduser
        /// </summary>
        /// <returns>Creates a new User and return it accordingly.</returns>
        [HttpGet("{email}")]
        public async Task<ActionResult<UserDTO>> GetUser([FromQuery]string username)
        {
            // check if the Username/Email already exists
            ApplicationUser user = await _userManager.FindByNameAsync(username);
            if (user == null) return BadRequest("User does not extist");

            return new UserDTO(){ Username = user.UserName,
                                  Email = user.Email,
                                  DisplayName = user.DisplayName
            };
        }

        /// <summary>
        /// PUT: api/user/adduser
        /// </summary>
        /// <returns>Creates a new User and return it accordingly.</returns>
        [HttpPut()]
        public async Task<ActionResult<UserDTO>> AddUser([FromBody]UserDTO model)
        {
            // return a generic HTTP Status 500 (Server Error)
            // if the client payload is invalid.
            if (model == null) return new StatusCodeResult(500);

            // check if the Username/Email already exists
            ApplicationUser user = await _userManager.FindByNameAsync(model.Username);
            if (user != null) return BadRequest("Username already exists");

            user = await _userManager.FindByEmailAsync(model.Email);
            if (user != null) return BadRequest("Email already exists.");

            var now = DateTime.Now;

            // create a new Item with the client-sent json data
            user = new ApplicationUser()
            {
                SecurityStamp = Guid.NewGuid().ToString(),
                UserName = model.Username,
                Email = model.Email,
                DisplayName = model.DisplayName,
                CreatedDate = now,
                LastModifiedDate = now
            };

            // Add the user to the Db with the choosen password
            await _userManager.CreateAsync(user, model.Password);

            // Assign the user to the 'RegisteredUser' role.
            await _userManager.AddToRoleAsync(user, "RegisteredUser");

            // Remove Lockout and E-Mail confirmation
            user.EmailConfirmed = true;
            user.LockoutEnabled = false;

            // persist the changes into the Database.
            _context.SaveChanges();

            // return the newly-created User to the client.
            return new UserDTO(){ Username = user.UserName,
                                  Email = user.Email,
                                  DisplayName = user.DisplayName
            };
        }
    }
}
