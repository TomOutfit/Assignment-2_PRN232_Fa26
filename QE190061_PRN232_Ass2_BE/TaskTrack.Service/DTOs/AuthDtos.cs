using System.ComponentModel.DataAnnotations;

namespace TaskTrack.Service.DTOs;

public class RegisterDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [MaxLength(100, ErrorMessage = "Full Name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    [MaxLength(150, ErrorMessage = "Email cannot exceed 150 characters.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    [MinLength(6, ErrorMessage = "Password must be at least 6 characters.")]
    public string Password { get; set; } = string.Empty;
}

public class LoginDto
{
    [Required(ErrorMessage = "Email is required.")]
    [EmailAddress(ErrorMessage = "Invalid email address format.")]
    public string Email { get; set; } = string.Empty;

    [Required(ErrorMessage = "Password is required.")]
    public string Password { get; set; } = string.Empty;
}

public class AuthResponseDto
{
    public string Token { get; set; } = string.Empty;
    public string RefreshToken { get; set; } = string.Empty;
    public int AccountId { get; set; }
    public string FullName { get; set; } = string.Empty;
    public string Email { get; set; } = string.Empty;
    public short Role { get; set; } // 0 = Staff, 1 = Admin
    public string RoleName => Role == 1 ? "Admin" : "Staff";
    public DateTime Expiration { get; set; }
}

public class RefreshTokenRequestDto
{
    [Required(ErrorMessage = "Token is required.")]
    public string Token { get; set; } = string.Empty;

    [Required(ErrorMessage = "RefreshToken is required.")]
    public string RefreshToken { get; set; } = string.Empty;
}

public class UpdateProfileDto
{
    [Required(ErrorMessage = "Full Name is required.")]
    [MaxLength(100, ErrorMessage = "Full Name cannot exceed 100 characters.")]
    public string FullName { get; set; } = string.Empty;

    [MinLength(6, ErrorMessage = "New Password must be at least 6 characters.")]
    public string? NewPassword { get; set; }
}
