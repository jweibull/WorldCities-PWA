using System.Text;
using Microsoft.AspNetCore.Identity;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.AspNetCore.Authentication.Google;
using Microsoft.AspNetCore.Authentication;

/*
using Serilog;
using Serilog.Events;
using Serilog.Sinks.MSSqlServer;
*/

using WorldCities.Data;
using WorldCities.Data.Models;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddControllers();

builder.Services.AddDbContext<ApplicationDbContext>(options =>
{
    options.UseSqlServer(builder.Configuration.GetConnectionString("DefaultConnection"));
});

builder.Services.AddDefaultIdentity<ApplicationUser>(options =>
{
    options.SignIn.RequireConfirmedAccount = builder.Configuration.GetValue<bool>("AppIdentitySettings:SignIn:RequireConfirmedAccount");
    options.User.RequireUniqueEmail = builder.Configuration.GetValue<bool>("AppIdentitySettings:User:RequireUniqueEmail");
    options.Password.RequireDigit = builder.Configuration.GetValue<bool>("AppIdentitySettings:Password:RequireDigit");
    options.Password.RequireLowercase = builder.Configuration.GetValue<bool>("AppIdentitySettings:Password:RequireLowercase");
    options.Password.RequireUppercase = builder.Configuration.GetValue<bool>("AppIdentitySettings:Password:RequireUppercase");
    options.Password.RequireNonAlphanumeric = builder.Configuration.GetValue<bool>("AppIdentitySettings:Password:RequireNonAlphanumeric");
    options.Password.RequiredLength = builder.Configuration.GetValue<int>("AppIdentitySettings:Password:RequiredLength");
    //options.Lockout.AllowedForNewUsers = builder.Configuration.GetValue<bool>("AppIdentitySettings:Lockout:AllowedForNewUsers");
    //options.Lockout.MaxFailedAccessAttempts = builder.Configuration.GetValue<int>("AppIdentitySettings:Lockout:MaxFailedAccessAttempts");
    //options.Lockout.DefaultLockoutTimeSpan = builder.Configuration.GetValue<TimeSpan>("AppIdentitySettings:Lockout:DefaultLockoutTimeSpanInMins");
}).AddRoles<IdentityRole>().AddEntityFrameworkStores<ApplicationDbContext>();


builder.Services.AddAuthentication(opts =>
{
    opts.DefaultScheme = JwtBearerDefaults.AuthenticationScheme;
    opts.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    opts.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
}).AddJwtBearer(cfg =>
{
    cfg.RequireHttpsMetadata = false;
    cfg.SaveToken = true;
    cfg.TokenValidationParameters = new TokenValidationParameters()
    {
        // standard configuration
        ValidIssuer = builder.Configuration["Auth:Jwt:Issuer"],
        ValidAudience = builder.Configuration["Auth:Jwt:Audience"],
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(builder.Configuration["Auth:Jwt:Key"])),
        ClockSkew = TimeSpan.Zero,
        // security switches
        RequireExpirationTime = true,
        ValidateIssuer = true,
        ValidateIssuerSigningKey = true,
        ValidateAudience = true
    };
}).AddGoogle(googleOptions =>
    {
        googleOptions.ClientId = builder.Configuration["Auth:Google:ClientId"];
        googleOptions.ClientSecret = builder.Configuration["Auth:Google:ClientSecret"];
    });

/* 
builder.Host.UseSerilog((ctx, lc) => lc
    .WriteTo.Console()
    .WriteTo.MSSqlServer(connectionString: builder.Configuration.GetConnectionString("DefaultConnection"), 
        restrictedToMinimumLevel: LogEventLevel.Information,
        sinkOptions: new MSSqlServerSinkOptions { 
            TableName = "LogEvents", 
            AutoCreateSqlTable = true 
        }
    )
); 
*/

var app = builder.Build();

// Configure the HTTP request pipeline.
if (!app.Environment.IsDevelopment())
{
    app.UseHsts();
}

app.UseStaticFiles(new StaticFileOptions()
{
    OnPrepareResponse = (context) =>
    {
        // Retrieve cache configuration from appsettings.json
        context.Context.Response.Headers["Cache-Control"] = builder.Configuration["StaticFiles:Headers:Cache-Control"];
    }
});

app.UseHttpsRedirection();

app.MapControllers();
app.UseAuthentication();
app.UseAuthorization();

app.MapFallbackToFile("index.html");

//app.UseSerilogRequestLogging();

app.Run();
