using TaskTrack.Repo.Models;

namespace TaskTrack.Service.Services;

public interface IJwtTokenGenerator
{
    (string Token, DateTime Expiration) GenerateToken(SystemAccount account);
}
