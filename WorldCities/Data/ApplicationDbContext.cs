using Microsoft.AspNetCore.Identity.EntityFrameworkCore;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

using WorldCities.Data.Models;


namespace WorldCities.Data
{
    public class ApplicationDbContext : IdentityDbContext<ApplicationUser>
    {
        public ApplicationDbContext(DbContextOptions options)
        : base(options)
        {
        }
        public virtual DbSet<City>? Cities { get; set; }
        public virtual DbSet<Country>? Countries { get; set; }
        public virtual DbSet<Token>? Tokens { get; set; }
    }
}