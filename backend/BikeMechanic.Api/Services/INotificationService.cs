using BikeMechanic.Api.Entities;

namespace BikeMechanic.Api.Services;

public interface INotificationService
{
    Task<Notification> CreateAsync(int clientId, string title, string message, NotificationType type, int? referenceId = null);
}
