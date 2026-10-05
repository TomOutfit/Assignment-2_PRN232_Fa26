using TaskTrack.Repo.Models;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Services;

public class AccountService : IAccountService
{
    private readonly IAccountRepository _accountRepository;

    public AccountService(IAccountRepository accountRepository)
    {
        _accountRepository = accountRepository;
    }

    public async Task<IEnumerable<AccountDto>> GetAllAsync()
    {
        var accounts = await _accountRepository.GetAllAsync();
        return accounts.Select(a => new AccountDto
        {
            AccountId = a.AccountId,
            FullName = a.FullName,
            Email = a.Email,
            Role = a.Role,
            CreatedDate = a.CreatedDate,
            CreatedTasksCount = a.CreatedTasks?.Count ?? 0
        });
    }

    public async Task<AccountDto?> GetByIdAsync(int id)
    {
        var account = await _accountRepository.GetByIdAsync(id);
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

    public async Task<AccountDto?> UpdateAsync(int id, UpdateAccountDto dto)
    {
        var account = await _accountRepository.GetByIdAsync(id);
        if (account == null) return null;

        account.FullName = dto.FullName.Trim();
        account.Role = dto.Role;

        await _accountRepository.UpdateAsync(account);

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

    public async Task<(bool Success, string? ErrorMessage)> DeleteAsync(int id)
    {
        var account = await _accountRepository.GetByIdAsync(id);
        if (account == null)
        {
            return (false, "Account not found.");
        }

        var hasTasks = await _accountRepository.HasCreatedTasksAsync(id);
        if (hasTasks)
        {
            return (false, "Cannot delete account: This account has created active tasks in the system.");
        }

        await _accountRepository.DeleteAsync(account);
        return (true, null);
    }
}
