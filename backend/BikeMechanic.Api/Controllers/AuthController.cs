using BikeMechanic.Api.Configuration;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Auth;
using BikeMechanic.Api.Entities;
using BikeMechanic.Api.Services;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Options;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/auth")]
public class AuthController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly IJwtTokenService _jwtTokenService;
    private readonly JwtSettings _jwtSettings;

    public AuthController(AppDbContext db, IJwtTokenService jwtTokenService, IOptions<JwtSettings> jwtSettings)
    {
        _db = db;
        _jwtTokenService = jwtTokenService;
        _jwtSettings = jwtSettings.Value;
    }

    [HttpPost("register")]
    public async Task<ActionResult<AuthResponse>> Register(RegisterRequest request)
    {
        var normalizedPhone = request.Phone.Trim();

        var exists = await _db.Users.AnyAsync(u => u.Phone == normalizedPhone);
        if (exists)
        {
            return Conflict(new { message = "An account with this phone number already exists." });
        }

        var user = new User
        {
            Name = request.Name.Trim(),
            Phone = normalizedPhone,
            Email = request.Email?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(request.Password),
            Role = request.Role,
            IsActive = true
        };

        _db.Users.Add(user);

        if (request.Role == UserRole.Client)
        {
            var client = new Client
            {
                User = user,
                Name = user.Name,
                Phone = user.Phone,
                Email = user.Email,
                Address = request.Address,
                IsActive = true
            };
            _db.Clients.Add(client);
        }

        await _db.SaveChangesAsync();

        return await BuildAuthResponse(user);
    }

    [HttpPost("login")]
    public async Task<ActionResult<AuthResponse>> Login(LoginRequest request)
    {
        var user = await _db.Users
            .Include(u => u.Client)
            .FirstOrDefaultAsync(u => u.Phone == request.Phone.Trim());

        if (user is null || !user.IsActive || !BCrypt.Net.BCrypt.Verify(request.Password, user.PasswordHash))
        {
            return Unauthorized(new { message = "Invalid phone number or password." });
        }

        return await BuildAuthResponse(user);
    }

    [HttpPost("refresh")]
    public async Task<ActionResult<AuthResponse>> Refresh(RefreshRequest request)
    {
        var tokenHash = _jwtTokenService.HashToken(request.RefreshToken);

        var storedToken = await _db.RefreshTokens
            .Include(rt => rt.User)
            .ThenInclude(u => u.Client)
            .FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (storedToken is null || !storedToken.IsActive)
        {
            return Unauthorized(new { message = "Invalid or expired refresh token." });
        }

        storedToken.RevokedAt = DateTime.UtcNow;

        return await BuildAuthResponse(storedToken.User);
    }

    [HttpPost("logout")]
    public async Task<IActionResult> Logout(RefreshRequest request)
    {
        var tokenHash = _jwtTokenService.HashToken(request.RefreshToken);
        var storedToken = await _db.RefreshTokens.FirstOrDefaultAsync(rt => rt.TokenHash == tokenHash);

        if (storedToken is not null && storedToken.RevokedAt is null)
        {
            storedToken.RevokedAt = DateTime.UtcNow;
            await _db.SaveChangesAsync();
        }

        return NoContent();
    }

    private async Task<ActionResult<AuthResponse>> BuildAuthResponse(User user)
    {
        var (accessToken, expiresAt) = _jwtTokenService.GenerateAccessToken(user);
        var refreshToken = _jwtTokenService.GenerateRefreshToken();

        _db.RefreshTokens.Add(new RefreshToken
        {
            UserId = user.Id,
            TokenHash = _jwtTokenService.HashToken(refreshToken),
            ExpiresAt = DateTime.UtcNow.AddDays(_jwtSettings.RefreshTokenDays)
        });

        await _db.SaveChangesAsync();

        var client = user.Client ?? await _db.Clients.FirstOrDefaultAsync(c => c.UserId == user.Id);

        return new AuthResponse
        {
            AccessToken = accessToken,
            RefreshToken = refreshToken,
            ExpiresAt = expiresAt,
            User = new UserSummary
            {
                Id = user.Id,
                Name = user.Name,
                Phone = user.Phone,
                Email = user.Email,
                Role = user.Role.ToString(),
                ClientId = client?.Id
            }
        };
    }
}
