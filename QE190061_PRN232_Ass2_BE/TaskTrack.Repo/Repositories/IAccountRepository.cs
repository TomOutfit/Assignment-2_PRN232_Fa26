using TaskTrack.Repo.Models;

namespace TaskTrack.Repo.Repositories;

public interface IAccountRepository
{
    System.Threading.Tasks.Task<IEnumerable<SystemAccount>> GetAllAsync();
    System.Threading.Tasks.Task<SystemAccount?> GetByIdAsync(int id);
    System.Threading.Tasks.Task<SystemAccount?> GetByEmailAsync(string email);
    System.Threading.Tasks.Task<SystemAccount> CreateAsync(SystemAccount account);
    System.Threading.Tasks.Task UpdateAsync(SystemAccount account);
    System.Threading.Tasks.Task DeleteAsync(SystemAccount account);
    System.Threading.Tasks.Task<bool> HasCreatedTasksAsync(int accountId);
}
