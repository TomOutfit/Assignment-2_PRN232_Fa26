using TaskTrack.Service.DTOs;

namespace TaskTrack.Service.Services;

public interface IAccountService
{
    Task<IEnumerable<AccountDto>> GetAllAsync();
    Task<AccountDto?> GetByIdAsync(int id);
    Task<AccountDto?> UpdateAsync(int id, UpdateAccountDto dto);
    Task<(bool Success, string? ErrorMessage)> DeleteAsync(int id);
}
