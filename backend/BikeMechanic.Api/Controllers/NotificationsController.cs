using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Notifications;
using BikeMechanic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/notifications")]
[Authorize]
public class NotificationsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public NotificationsController(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<List<NotificationResponse>>> GetAll()
    {
        var query = _db.Notifications.Include(n => n.Client).AsQueryable();

        if (_currentUser.IsClient)
        {
            var ownClientId = await _db.Clients
                .Where(c => c.UserId == _currentUser.UserId)
                .Select(c => (int?)c.Id)
                .FirstOrDefaultAsync();

            if (!ownClientId.HasValue)
            {
                return Forbid();
            }

            query = query.Where(n => n.ClientId == ownClientId.Value);
        }

        var notifications = await query.OrderByDescending(n => n.CreatedAt).ToListAsync();
        return notifications.Select(ToResponse).ToList();
    }

    [HttpPost("{id:int}/read")]
    public async Task<IActionResult> MarkRead(int id)
    {
        var notification = await _db.Notifications.FirstOrDefaultAsync(n => n.Id == id);
        if (notification is null)
        {
            return NotFound();
        }

        if (_currentUser.IsClient)
        {
            var ownClientId = await _db.Clients
                .Where(c => c.UserId == _currentUser.UserId)
                .Select(c => (int?)c.Id)
                .FirstOrDefaultAsync();

            if (!ownClientId.HasValue || ownClientId.Value != notification.ClientId)
            {
                return Forbid();
            }
        }

        notification.IsRead = true;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static NotificationResponse ToResponse(Entities.Notification n) => new()
    {
        Id = n.Id,
        ClientId = n.ClientId,
        ClientName = n.Client.Name,
        Title = n.Title,
        Message = n.Message,
        Type = n.Type.ToString(),
        ReferenceId = n.ReferenceId,
        IsRead = n.IsRead,
        SentAt = n.SentAt,
        CreatedAt = n.CreatedAt
    };
}
