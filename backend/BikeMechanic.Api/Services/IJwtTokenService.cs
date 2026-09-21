using System.Security.Claims;
using BikeMechanic.Api.Entities;

namespace BikeMechanic.Api.Services;

public interface IJwtTokenService
{
    (string token, DateTime expiresAt) GenerateAccessToken(User user);
    string GenerateRefreshToken();
    string HashToken(string token);
}
