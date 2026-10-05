using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;
using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using TaskTrack.Repo.Models;

namespace TaskTrack.Service.Services;

public class JwtTokenGenerator : IJwtTokenGenerator
{
    private readonly IConfiguration _configuration;

    public JwtTokenGenerator(IConfiguration configuration)
    {
        _configuration = configuration;
    }

    public (string Token, DateTime Expiration) GenerateToken(SystemAccount account)
    {
        var secret = _configuration["JWT_SECRET"]
                     ?? _configuration["JwtSettings:SecretKey"]
                     ?? "Default_Super_Secure_Secret_Key_For_PRN232_TaskTrack_Assignment_2_Must_Be_Long!";

        var issuer = _configuration["JwtSettings:Issuer"] ?? "TaskTrackAPI";
        var audience = _configuration["JwtSettings:Audience"] ?? "TaskTrackClient";
        var expirationHours = 24;

        if (int.TryParse(_configuration["JwtSettings:ExpirationHours"], out var hours))
        {
            expirationHours = hours;
        }

        var expiration = DateTime.UtcNow.AddHours(expirationHours);
        var key = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(secret));
        var credentials = new SigningCredentials(key, SecurityAlgorithms.HmacSha256);

        var roleName = account.Role == 1 ? "Admin" : "Staff";

        var claims = new List<Claim>
        {
            new(ClaimTypes.NameIdentifier, account.AccountId.ToString()),
            new("AccountID", account.AccountId.ToString()),
            new(ClaimTypes.Email, account.Email),
            new("Email", account.Email),
            new(ClaimTypes.Name, account.FullName),
            new("FullName", account.FullName),
            new(ClaimTypes.Role, roleName),
            new("Role", account.Role.ToString()),
            new("RoleName", roleName),
            new(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString())
        };

        var tokenDescriptor = new SecurityTokenDescriptor
        {
            Subject = new ClaimsIdentity(claims),
            Expires = expiration,
            Issuer = issuer,
            Audience = audience,
            SigningCredentials = credentials
        };

        var tokenHandler = new JwtSecurityTokenHandler();
        var token = tokenHandler.CreateToken(tokenDescriptor);
        return (tokenHandler.WriteToken(token), expiration);
    }
}
