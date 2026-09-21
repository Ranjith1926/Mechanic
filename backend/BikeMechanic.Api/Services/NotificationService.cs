using BikeMechanic.Api.Data;
using BikeMechanic.Api.Entities;

namespace BikeMechanic.Api.Services;

public class NotificationService : INotificationService
{
    private readonly AppDbContext _db;

    public NotificationService(AppDbContext db)
    {
        _db = db;
    }

    public async Task<Notification> CreateAsync(int clientId, string title, string message, NotificationType type, int? referenceId = null)
    {
        var notification = new Notification
        {
            ClientId = clientId,
            Title = title,
            Message = message,
            Type = type,
            ReferenceId = referenceId,
            SentAt = DateTime.UtcNow
        };

        _db.Notifications.Add(notification);
        await _db.SaveChangesAsync();

        return notification;
    }
}
