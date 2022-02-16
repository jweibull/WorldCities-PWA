namespace WorldCities.Data.DTO
{
    public class CityDTO
    {
        public CityDTO() {}

        public int Id { get; set; } = 0!;

        public string Name { get; set; } = ""!;

        public string Name_ASCII { get; set; } = ""!;

        public decimal Lat { get; set; }

        public decimal Lon { get; set; }

        public int CountryId { get; set; } = 0!;
        
        public string CountryName { get; set; } = ""!;
    }
}