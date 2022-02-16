using System.Text.Json.Serialization;

namespace WorldCities.Data.DTO
{
    public class CountryDTO
    {
        public CountryDTO() { }

        
        public int Id { get; set; }

        public string Name { get; set; } = ""!;
        
        [JsonPropertyName("iso2")]
        public string ISO2 { get; set; } = ""!;
        
        [JsonPropertyName("iso3")]
        public string ISO3 { get; set; } = ""!;
        
        public int TotCities { get; set; }
    }
}