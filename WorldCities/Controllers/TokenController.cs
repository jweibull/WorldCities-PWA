using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Identity;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using Microsoft.IdentityModel.Tokens;
using System.Text;
using System.Text.Json;


using WorldCities.Data;
using WorldCities.Data.DTO;
using WorldCities.Data.Models;


namespace WorldCities.Controllers
{

    [Route("api/[controller]/[action]")]
    [ApiController]    
    public class TokenController : ControllerBase
    {
        private readonly ApplicationDbContext _context;
        private readonly ILogger<TokenController> _logger; 
        private readonly RoleManager<IdentityRole> _roleManager;
        private readonly UserManager<ApplicationUser> _userManager;
        private readonly IConfiguration _configuration;
        private readonly SignInManager<ApplicationUser> _signInManager;
        public TokenController(
            ApplicationDbContext context, 
            ILogger<TokenController> logger, 
            RoleManager<IdentityRole> roleManager,
            UserManager<ApplicationUser> userManager,
            SignInManager<ApplicationUser> signInManager,
            IConfiguration configuration)
        {
            _context = context;
            _logger = logger;
            _roleManager = roleManager;
            _userManager = userManager;
            _configuration = configuration;
            _signInManager = signInManager;
        }

        [HttpPost]
        public async Task<ActionResult<TokenResponseDTO>> Auth([FromBody]TokenRequestDTO tokenRequest)
        {
            // return a generic HTTP Status 500 (Server Error)
            // if the client payload is invalid.
            if (tokenRequest == null) return new StatusCodeResult(500);
            
            switch (tokenRequest.GrantType)
            {
                case "password":
                    return await GetToken(tokenRequest);
                case "refresh_token":
                    return await RefreshToken(tokenRequest);
                default:
                    // not supported - return a HTTP 401 (Unauthorized)
                    return new UnauthorizedResult();
            }
        }

        [HttpGet("{provider}")]
        public IActionResult ExternalLogin(string provider, string? returnUrl = null)
        {
            switch (provider.ToLower())
            {
                case "google":
                    Console.WriteLine("Provider: " + provider);
                    Console.WriteLine("Return Url: " + returnUrl);
                // case "github":
                // todo: add all supported providers here

                    // Redirect the request to the external provider.
                    var redirectUrl = Url.Action(nameof(ExternalLoginCallback), "Token", new { returnUrl });
                    var properties = _signInManager.ConfigureExternalAuthenticationProperties(provider, redirectUrl);
                    return Challenge(properties, provider);
                default:
                    // provider not supported
                    return BadRequest(new { Error = String.Format("Provider '{0}' is not supported.", provider) });
            }
        }

        [HttpGet]
        public async Task<IActionResult> ExternalLoginCallback(string? returnUrl = null, string? remoteError = null)
        {
            if (!String.IsNullOrEmpty(remoteError))
            {
                // TODO: handle external provider errors
                throw new Exception(String.Format("External Provider error: {0}", remoteError));
            }

            // Extract the login info obtained from the External Provider
            var info = await _signInManager.GetExternalLoginInfoAsync();
            if (info == null)
            {
                // if there's none, emit an error
                throw new Exception("ERROR: No login info available.");
            }

            // Check if this user already registered himself with this external provider before
            var user = await _userManager.FindByLoginAsync(info.LoginProvider, info.ProviderKey);
            if (user == null)
            {
                // If we reach this point, it means that this user never tried to logged in
                // using this external provider. However, it could have used other providers 
                // and /or have a local account. 
                // We can find out if that's the case by looking for his e-mail address.

                // Retrieve the 'emailaddress' claim
                var emailKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress";
                var email = info.Principal.FindFirst(emailKey)?.Value;

                // Lookup if there's an username with this e-mail address in the Db
                user = await _userManager.FindByEmailAsync(email);
                if (user == null)
                {
                    // No user has been found: register a new user 
                    // using the info retrieved from the provider
                    DateTime now = DateTime.Now;

                    // Create a unique username using the 'nameidentifier' claim
                    var idKey = "http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier";
                    var username = String.Format("{0}{1}{2}",
                        info.LoginProvider,
                        info.Principal.FindFirst(idKey)?.Value,
                        Guid.NewGuid().ToString("N")
                    );

                    user = new ApplicationUser()
                    {
                        SecurityStamp = Guid.NewGuid().ToString(),
                        UserName = username,
                        Email = email,
                        CreatedDate = now,
                        LastModifiedDate = now
                    };

                    // Add the user to the Db with a random password
                    await _userManager.CreateAsync(
                        user,
                        DataHelper.GenerateRandomPassword());

                    // Assign the user to the 'RegisteredUser' role.
                    await _userManager.AddToRoleAsync(user, "RegisteredUser");

                    // Remove Lockout and E-Mail confirmation
                    user.EmailConfirmed = true;
                    user.LockoutEnabled = false;

                    // Persist everything into the Db
                    await _context.SaveChangesAsync();
                }
                // Register this external provider to the user
                var ir = await _userManager.AddLoginAsync(user, info);
                if (ir.Succeeded)
                {
                    // Persist everything into the Db
                    _context.SaveChanges();
                }
                else throw new Exception("Authentication error");
            }

            // create the refresh token
            var rt = CreateRefreshToken("TestMakerFree", user.Id);

            // add the new refresh token to the DB
            _context.Tokens?.Add(rt);
            _context.SaveChanges();

            // create & return the access token
            var t = CreateAccessToken(user.Id, rt.Value);

            // output a <SCRIPT> tag to call a JS function 
            // registered into the parent window global scope
            return Content(
                "<script type=\"text/javascript\">" +
                "window.opener.externalProviderLogin(" +
                    JsonSerializer.Serialize(t) +
                ");" +
                "window.close();" +
                "</script>",
                "text/html"
            );
        }

        private async Task<ActionResult<TokenResponseDTO>> GetToken(TokenRequestDTO tokenRequest)
        {
            if (_context.Tokens == null) return new UnauthorizedResult();
                        
            try
            {
                // check if there's an user with the given username
                var user = await _userManager.FindByNameAsync(tokenRequest.Username);
                // fallback to support e-mail address instead of username
                if (user == null && tokenRequest.Username.Contains("@"))
                    user = await _userManager.FindByEmailAsync(tokenRequest.Username);

                if (user == null || !await _userManager.CheckPasswordAsync(user, tokenRequest.Password))
                {
                    // user does not exists or password mismatch
                    return new UnauthorizedResult();
                }

                // username & password matches: create the refresh token
                var rt = CreateRefreshToken(tokenRequest.ClientId, user.Id);
                // add the new refresh token to the DB
                _context.Tokens.Add(rt);
                _context.SaveChanges();
                // create & return the access token
                var t = CreateAccessToken(user.Id, rt.Value);
                return t;
            }
            catch
            {
                return new UnauthorizedResult();
            }
        }

        private async Task<ActionResult<TokenResponseDTO>> RefreshToken(TokenRequestDTO model)
        {
            try
            {
                if (_context.Tokens == null)
                    return new UnauthorizedResult();
                // check if the received refreshToken exists for the given clientId
                var rt = _context.Tokens.FirstOrDefault(t => 
                    t.ClientId == model.ClientId && t.Value == model.RefreshToken);
                if (rt == null)
                {
                    // refresh token not found or invalid (or invalid clientId)
                    return new UnauthorizedResult();
                }
                // check if there's an user with the refresh token's userId
                var user = await _userManager.FindByIdAsync(rt.UserId);
                if (user == null)
                {
                    // UserId not found or invalid
                    return new UnauthorizedResult();
                }
                // generate a new refresh token
                var rtNew = CreateRefreshToken(rt.ClientId, rt.UserId);
                // invalidate the old refresh token (by deleting it)
                _context.Tokens.Remove(rt);
                // add the new refresh token
                _context.Tokens.Add(rtNew);
                // persist changes in the DB
                _context.SaveChanges();
                // create a new access token...
                var response = CreateAccessToken(rtNew.UserId, rtNew.Value);
                // ... and send it to the client
                return response;
            }
            catch
            {
                return new UnauthorizedResult();
            }
        }

        private Token CreateRefreshToken(string clientId, string userId)
        {
            return new Token()
            {
                ClientId = clientId,
                UserId = userId,
                Type = 0,
                Value = Guid.NewGuid().ToString("N"),
                CreatedDate = DateTime.UtcNow
            };
        }

        private TokenResponseDTO CreateAccessToken(string userId, string refreshToken)
        {
            DateTime now = DateTime.UtcNow;
            // add the registered claims for JWT (RFC7519).
            // For more info, see https://tools.ietf.org/html/rfc7519#section-4.1
            var claims = new[] {
                new Claim(JwtRegisteredClaimNames.Sub, userId),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()),
                new Claim(JwtRegisteredClaimNames.Iat, new DateTimeOffset(now).ToUnixTimeSeconds().ToString())
                // TODO: add additional claims here
            };
            var tokenExpirationMins = _configuration.GetValue<int>
                ("Auth:Jwt:TokenExpirationInMinutes");
            var issuerSigningKey = new SymmetricSecurityKey(
                Encoding.UTF8.GetBytes(_configuration["Auth:Jwt:Key"]));
            var token = new JwtSecurityToken(
                issuer: _configuration["Auth:Jwt:Issuer"],
                audience: _configuration["Auth:Jwt:Audience"],
                claims: claims,
                notBefore: now,
                expires: now.Add(TimeSpan.FromMinutes(tokenExpirationMins)),
                signingCredentials: new SigningCredentials(issuerSigningKey, SecurityAlgorithms.HmacSha256)
            );
            var encodedToken = new JwtSecurityTokenHandler().WriteToken(token);
            return new TokenResponseDTO()
            {
                Token = encodedToken,
                Expiration = tokenExpirationMins,
                RefreshToken = refreshToken
            };
        }
    }
}
