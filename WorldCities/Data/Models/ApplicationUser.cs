using Microsoft.AspNetCore.Identity;
using System.ComponentModel.DataAnnotations;

namespace WorldCities.Data.Models
{
    public class ApplicationUser : IdentityUser
    {
        public string DisplayName { get; set; } = "";

        public string Notes { get; set; } = "";

        [Required]
        public int Type { get; set; } = 0;

        [Required]
        public int Flags { get; set; } = 0;

        [Required]
        public DateTime CreatedDate { get; set; }

        [Required]
        public DateTime LastModifiedDate { get; set; }
        /// <summary>
        /// A list of all the refresh tokens issued for this users.
        /// </summary>
        public virtual List<Token> Tokens { get; set; } = new();
    }
}
