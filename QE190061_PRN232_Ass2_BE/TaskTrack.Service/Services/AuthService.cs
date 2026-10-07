using BCrypt.Net;
using TaskTrack.Repo.Models;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Services;

public class AuthService : IAuthService
{
    private readonly IAccountRepository _accountRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    private static readonly System.Collections.Concurrent.ConcurrentDictionary<string, (int AccountId, DateTime Expiry)> _refreshTokens
        = new System.Collections.Concurrent.ConcurrentDictionary<string, (int AccountId, DateTime Expiry)>();

    public AuthService(IAccountRepository accountRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _accountRepository = accountRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
    }

    private static string GenerateRefreshTokenString()
    {
        var randomBytes = new byte[64];
        using var rng = System.Security.Cryptography.RandomNumberGenerator.Create();
        rng.GetBytes(randomBytes);
        return Convert.ToBase64String(randomBytes);
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> RegisterAsync(RegisterDto dto)
    {
        var existingAccount = await _accountRepository.GetByEmailAsync(dto.Email);
        if (existingAccount != null)
        {
            return (false, "Email is already registered in the system.", null);
        }

        var passwordHash = BCrypt.Net.BCrypt.HashPassword(dto.Password);

        var account = new SystemAccount
        {
            FullName = dto.FullName.Trim(),
            Email = dto.Email.Trim().ToLower(),
            PasswordHash = passwordHash,
            Role = 0, // Explicitly Staff role
            CreatedDate = DateTime.UtcNow
        };

        var createdAccount = await _accountRepository.CreateAsync(account);
        var (token, expiration) = _jwtTokenGenerator.GenerateToken(createdAccount);
        var refreshToken = GenerateRefreshTokenString();

        _refreshTokens[refreshToken] = (createdAccount.AccountId, DateTime.UtcNow.AddDays(7));

        var response = new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            AccountId = createdAccount.AccountId,
            FullName = createdAccount.FullName,
            Email = createdAccount.Email,
            Role = createdAccount.Role,
            Expiration = expiration
        };

        return (true, null, response);
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> LoginAsync(LoginDto dto)
    {
        var account = await _accountRepository.GetByEmailAsync(dto.Email);
        if (account == null)
        {
            return (false, "Invalid email or password.", null);
        }

        bool isPasswordValid;
        try
        {
            isPasswordValid = BCrypt.Net.BCrypt.Verify(dto.Password, account.PasswordHash);
        }
        catch
        {
            isPasswordValid = false;
        }

        if (!isPasswordValid)
        {
            return (false, "Invalid email or password.", null);
        }

        var (token, expiration) = _jwtTokenGenerator.GenerateToken(account);
        var refreshToken = GenerateRefreshTokenString();

        _refreshTokens[refreshToken] = (account.AccountId, DateTime.UtcNow.AddDays(7));

        var response = new AuthResponseDto
        {
            Token = token,
            RefreshToken = refreshToken,
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            Expiration = expiration
        };

        return (true, null, response);
    }

    public async Task<(bool Success, string? ErrorMessage, AuthResponseDto? Response)> RefreshTokenAsync(RefreshTokenRequestDto dto)
    {
        if (string.IsNullOrWhiteSpace(dto.RefreshToken) || !_refreshTokens.TryGetValue(dto.RefreshToken, out var tokenData))
        {
            return (false, "Invalid or expired refresh token.", null);
        }

        if (tokenData.Expiry < DateTime.UtcNow)
        {
            _refreshTokens.TryRemove(dto.RefreshToken, out _);
            return (false, "Refresh token has expired. Please login again.", null);
        }

        var account = await _accountRepository.GetByIdAsync(tokenData.AccountId);
        if (account == null)
        {
            _refreshTokens.TryRemove(dto.RefreshToken, out _);
            return (false, "Account associated with refresh token was not found.", null);
        }

        // Rotate Refresh Token
        _refreshTokens.TryRemove(dto.RefreshToken, out _);
        var newRefreshToken = GenerateRefreshTokenString();
        _refreshTokens[newRefreshToken] = (account.AccountId, DateTime.UtcNow.AddDays(7));

        var (newToken, expiration) = _jwtTokenGenerator.GenerateToken(account);

        var response = new AuthResponseDto
        {
            Token = newToken,
            RefreshToken = newRefreshToken,
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            Expiration = expiration
        };

        return (true, null, response);
    }

    public async Task<AccountDto?> GetProfileAsync(int accountId)
    {
        var account = await _accountRepository.GetByIdAsync(accountId);
        if (account == null) return null;

        return new AccountDto
        {
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            CreatedDate = account.CreatedDate,
            CreatedTasksCount = account.CreatedTasks?.Count ?? 0
        };
    }

    public async Task<(bool Success, string? ErrorMessage, AccountDto? Account)> UpdateProfileAsync(int accountId, UpdateProfileDto dto)
    {
        var account = await _accountRepository.GetByIdAsync(accountId);
        if (account == null)
            return (false, "Account not found.", null);

        if (!string.IsNullOrWhiteSpace(dto.FullName))
        {
            account.FullName = dto.FullName.Trim();
        }

        if (!string.IsNullOrWhiteSpace(dto.NewPassword))
        {
            account.PasswordHash = BCrypt.Net.BCrypt.HashPassword(dto.NewPassword);
        }

        await _accountRepository.UpdateAsync(account);
        var accountDto = new AccountDto
        {
            AccountId = account.AccountId,
            FullName = account.FullName,
            Email = account.Email,
            Role = account.Role,
            CreatedDate = account.CreatedDate,
            CreatedTasksCount = account.CreatedTasks?.Count ?? 0
        };

        return (true, null, accountDto);
    }
}
