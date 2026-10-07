using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Services;

public interface IAuthService
{
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> RegisterAsync(RegisterDto dto);
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> LoginAsync(LoginDto dto);
    Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> RefreshTokenAsync(RefreshTokenRequestDto dto);
    Task<AccountDto?> GetProfileAsync(int accountId);
    Task<(bool Success, string? ErrorMessage, AccountDto? Account)> UpdateProfileAsync(int accountId, UpdateProfileDto dto);
}
