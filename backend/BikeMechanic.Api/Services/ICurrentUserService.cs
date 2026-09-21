namespace BikeMechanic.Api.Services;

public interface ICurrentUserService
{
    int UserId { get; }
    string Role { get; }
    bool IsMechanic { get; }
    bool IsClient { get; }
}
