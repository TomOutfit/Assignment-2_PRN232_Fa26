using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Services;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
[Authorize(Roles = "Admin")]
public class AccountsController : ControllerBase
{
    private readonly IAccountService _accountService;

    public AccountsController(IAccountService accountService)
    {
        _accountService = accountService;
    }

    /// <summary>
    /// List all accounts (Admin only)
    /// </summary>
    [HttpGet]
    public async Task<ActionResult<IEnumerable<AccountDto>>> GetAll()
    {
        var accounts = await _accountService.GetAllAsync();
        return Ok(accounts);
    }

    /// <summary>
    /// Get one account by ID (Admin only)
    /// </summary>
    [HttpGet("{id:int}")]
    public async Task<ActionResult<AccountDto>> GetById(int id)
    {
        var account = await _accountService.GetByIdAsync(id);
        if (account == null)
            return NotFound(new { message = $"Account with ID {id} not found." });

        return Ok(account);
    }

    /// <summary>
    /// Update account name or role (Admin only)
    /// </summary>
    [HttpPut("{id:int}")]
    public async Task<ActionResult<AccountDto>> Update(int id, [FromBody] UpdateAccountDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var updated = await _accountService.UpdateAsync(id, dto);
        if (updated == null)
            return NotFound(new { message = $"Account with ID {id} not found." });

        return Ok(updated);
    }

    /// <summary>
    /// Delete account (Admin only - rejected if account has created active tasks)
    /// </summary>
    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Delete(int id)
    {
        var (success, errorMessage) = await _accountService.DeleteAsync(id);
        if (!success)
        {
            if (errorMessage != null && errorMessage.Contains("not found", StringComparison.OrdinalIgnoreCase))
            {
                return NotFound(new { message = errorMessage });
            }
            return BadRequest(new { message = errorMessage });
        }

        return NoContent();
    }
}
