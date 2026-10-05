using Microsoft.EntityFrameworkCore;
using TaskTrack.Repo.Models;

namespace TaskTrack.Repo.Repositories;

public class AccountRepository : IAccountRepository
{
    private readonly TaskTrackDbContext _context;

    public AccountRepository(TaskTrackDbContext context)
    {
        _context = context;
    }

    public async System.Threading.Tasks.Task<IEnumerable<SystemAccount>> GetAllAsync()
    {
        return await _context.SystemAccounts
            .Include(a => a.CreatedTasks)
            .OrderBy(a => a.AccountId)
            .ToListAsync();
    }

    public async System.Threading.Tasks.Task<SystemAccount?> GetByIdAsync(int id)
    {
        return await _context.SystemAccounts
            .Include(a => a.CreatedTasks)
            .FirstOrDefaultAsync(a => a.AccountId == id);
    }

    public async System.Threading.Tasks.Task<SystemAccount?> GetByEmailAsync(string email)
    {
        return await _context.SystemAccounts
            .FirstOrDefaultAsync(a => a.Email.ToLower() == email.Trim().ToLower());
    }

    public async System.Threading.Tasks.Task<SystemAccount> CreateAsync(SystemAccount account)
    {
        _context.SystemAccounts.Add(account);
        await _context.SaveChangesAsync();
        return account;
    }

    public async System.Threading.Tasks.Task UpdateAsync(SystemAccount account)
    {
        _context.Entry(account).State = EntityState.Modified;
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task DeleteAsync(SystemAccount account)
    {
        _context.SystemAccounts.Remove(account);
        await _context.SaveChangesAsync();
    }

    public async System.Threading.Tasks.Task<bool> HasCreatedTasksAsync(int accountId)
    {
        return await _context.Tasks.AnyAsync(t => t.CreatedById == accountId);
    }
}
