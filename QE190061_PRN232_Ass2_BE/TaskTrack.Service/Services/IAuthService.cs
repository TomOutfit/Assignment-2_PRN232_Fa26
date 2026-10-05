using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Services;

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> RegisterAsync(RegisterDto dto);
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> LoginAsync(LoginDto dto);
    Task<AccountDto?> GetProfileAsync(int accountId);
}
