namespace WorldCities.Data.DTO
{
    public class TokenResponseDTO
    {      
        public string Token { get; set; } = "";
        public int Expiration { get; set; }
        public string RefreshToken { get; set; } = "";
    }
}
