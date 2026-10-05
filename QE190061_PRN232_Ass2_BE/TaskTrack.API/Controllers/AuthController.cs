using System.Security.Claims;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using TaskTrack.Service.DTOs;
using TaskTrack.Service.Services;

namespace TaskTrack.API.Controllers;

[ApiController]
[Route("api/[controller]")]
public class AuthController : ControllerBase
{
    private readonly IAuthService _authService;

    public AuthController(IAuthService authService)
    {
        _authService = authService;
    }

    /// <summary>
    /// Register a new Staff account (Public - no token required)
    /// </summary>
    [HttpPost("register")]
    public async Task<ActionResult<AuthResponseDto>> Register([FromBody] RegisterDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, errorMessage, response) = await _authService.RegisterAsync(dto);
        if (!success)
        {
            if (errorMessage != null && errorMessage.Contains("already registered", StringComparison.OrdinalIgnoreCase))
            {
                return Conflict(new { message = errorMessage });
            }
            return BadRequest(new { message = errorMessage });
        }

        return StatusCode(StatusCodes.Status201Created, response);
    }

    /// <summary>
    /// Authenticate user credentials and return signed JWT token (Public - no token required)
    /// </summary>
    [HttpPost("login")]
    public async Task<ActionResult<AuthResponseDto>> Login([FromBody] LoginDto dto)
    {
        if (!ModelState.IsValid)
            return BadRequest(ModelState);

        var (success, errorMessage, response) = await _authService.LoginAsync(dto);
        if (!success)
        {
            return Unauthorized(new { message = errorMessage ?? "Invalid email or password." });
        }

        return Ok(response);
    }

    /// <summary>
    /// Get current logged-in user profile (Requires valid token)
    /// </summary>
    [HttpGet("me")]
    [Authorize]
    public async Task<ActionResult<AccountDto>> GetCurrentProfile()
    {
        var idClaim = User.FindFirstValue(ClaimTypes.NameIdentifier) ?? User.FindFirstValue("AccountID");
        if (!int.TryParse(idClaim, out var accountId))
        {
            return Unauthorized(new { message = "Invalid token payload." });
        }

        var profile = await _authService.GetProfileAsync(accountId);
        if (profile == null)
            return NotFound(new { message = "User account not found." });

        return Ok(profile);
    }
}
