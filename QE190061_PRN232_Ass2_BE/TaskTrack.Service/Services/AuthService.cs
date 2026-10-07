using BCrypt.Net;
using TaskTrack.Repo.Models;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Services;

public class AuthService : IAuthService
{
    private readonly IAccountRepository _accountRepository;
    private readonly IJwtTokenGenerator _jwtTokenGenerator;

    public AuthService(IAccountRepository accountRepository, IJwtTokenGenerator jwtTokenGenerator)
    {
        _accountRepository = accountRepository;
        _jwtTokenGenerator = jwtTokenGenerator;
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

        var response = new AuthResponseDto
        {
            Token = token,
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

        var response = new AuthResponseDto
        {
            Token = token,
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
