using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.FollowUps;
using BikeMechanic.Api.Entities;
using BikeMechanic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/follow-ups")]
[Authorize]
public class FollowUpsController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly INotificationService _notificationService;

    public FollowUpsController(AppDbContext db, ICurrentUserService currentUser, INotificationService notificationService)
    {
        _db = db;
        _currentUser = currentUser;
        _notificationService = notificationService;
    }

    [HttpGet]
    public async Task<ActionResult<List<FollowUpResponse>>> GetAll([FromQuery] FollowUpStatus? status)
    {
        var query = await ScopedQuery();
        if (query is null)
        {
            return Forbid();
        }

        if (status.HasValue)
        {
            query = query.Where(f => f.Status == status.Value);
        }

        var followUps = await query.OrderBy(f => f.FollowUpDate).ToListAsync();
        return followUps.Select(ToResponse).ToList();
    }

    [HttpGet("today")]
    public async Task<ActionResult<List<FollowUpResponse>>> GetToday()
    {
        var query = await ScopedQuery();
        if (query is null)
        {
            return Forbid();
        }

        var today = DateTime.UtcNow.Date;
        var followUps = await query
            .Where(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date == today)
            .OrderBy(f => f.FollowUpDate)
            .ToListAsync();

        return followUps.Select(ToResponse).ToList();
    }

    [HttpGet("upcoming")]
    public async Task<ActionResult<List<FollowUpResponse>>> GetUpcoming()
    {
        var query = await ScopedQuery();
        if (query is null)
        {
            return Forbid();
        }

        var today = DateTime.UtcNow.Date;
        var followUps = await query
            .Where(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date > today)
            .OrderBy(f => f.FollowUpDate)
            .ToListAsync();

        return followUps.Select(ToResponse).ToList();
    }

    [HttpPost]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<FollowUpResponse>> Create(CreateFollowUpRequest request)
    {
        var service = await _db.Services.Include(s => s.Bike).FirstOrDefaultAsync(s => s.Id == request.ServiceId);
        if (service is null)
        {
            return BadRequest(new { message = "Service not found." });
        }

        var followUp = new FollowUp
        {
            ClientId = service.Bike.ClientId,
            BikeId = service.BikeId,
            ServiceId = service.Id,
            FollowUpDate = request.FollowUpDate,
            FollowUpType = request.FollowUpType,
            Notes = request.Notes,
            Status = FollowUpStatus.Pending
        };

        _db.FollowUps.Add(followUp);
        await _db.SaveChangesAsync();

        var created = await BaseQuery().FirstAsync(f => f.Id == followUp.Id);
        return CreatedAtAction(nameof(GetById), new { id = followUp.Id }, ToResponse(created));
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<FollowUpResponse>> GetById(int id)
    {
        var followUp = await BaseQuery().FirstOrDefaultAsync(f => f.Id == id);
        if (followUp is null)
        {
            return NotFound();
        }

        if (!await CanAccess(followUp))
        {
            return Forbid();
        }

        return ToResponse(followUp);
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<FollowUpResponse>> Update(int id, UpdateFollowUpRequest request)
    {
        var followUp = await _db.FollowUps.FirstOrDefaultAsync(f => f.Id == id);
        if (followUp is null)
        {
            return NotFound();
        }

        followUp.FollowUpDate = request.FollowUpDate;
        followUp.FollowUpType = request.FollowUpType;
        followUp.Notes = request.Notes;

        if (request.Status == FollowUpStatus.Completed && followUp.Status != FollowUpStatus.Completed)
        {
            followUp.CompletedAt = DateTime.UtcNow;
        }
        else if (request.Status != FollowUpStatus.Completed)
        {
            followUp.CompletedAt = null;
        }
        followUp.Status = request.Status;

        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(f => f.Id == id);
        return ToResponse(updated);
    }

    [HttpPost("{id:int}/notify")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<IActionResult> Notify(int id)
    {
        var followUp = await BaseQuery().FirstOrDefaultAsync(f => f.Id == id);
        if (followUp is null)
        {
            return NotFound();
        }

        var message = $"Reminder: your {followUp.Bike.Brand} {followUp.Bike.Model} ({followUp.Bike.RegistrationNumber}) " +
                      $"is due for {FormatType(followUp.FollowUpType)} on {followUp.FollowUpDate:dd-MMM-yyyy}.";

        await _notificationService.CreateAsync(
            followUp.ClientId,
            "Follow-up Reminder",
            message,
            NotificationType.FollowUpReminder,
            followUp.Id);

        followUp.NotificationSent = true;
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private IQueryable<FollowUp> BaseQuery() =>
        _db.FollowUps
            .Include(f => f.Client)
            .Include(f => f.Bike)
            .Include(f => f.Service).ThenInclude(s => s.Invoice);

    private async Task<IQueryable<FollowUp>?> ScopedQuery()
    {
        if (_currentUser.IsMechanic)
        {
            return BaseQuery();
        }

        var ownClientId = await _db.Clients
            .Where(c => c.UserId == _currentUser.UserId)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync();

        if (!ownClientId.HasValue)
        {
            return null;
        }

        return BaseQuery().Where(f => f.ClientId == ownClientId.Value);
    }

    private async Task<bool> CanAccess(FollowUp followUp)
    {
        if (_currentUser.IsMechanic)
        {
            return true;
        }

        var ownClientId = await _db.Clients
            .Where(c => c.UserId == _currentUser.UserId)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync();

        return ownClientId.HasValue && ownClientId.Value == followUp.ClientId;
    }

    private static string FormatType(FollowUpType type) => type switch
    {
        FollowUpType.GeneralService => "a general service",
        FollowUpType.EngineOil => "an engine oil change",
        FollowUpType.BrakeCheck => "a brake check",
        FollowUpType.TyreCheck => "a tyre check",
        _ => "a follow-up"
    };

    private static FollowUpResponse ToResponse(FollowUp f) => new()
    {
        Id = f.Id,
        ClientId = f.ClientId,
        ClientName = f.Client.Name,
        ClientPhone = f.Client.Phone,
        BikeId = f.BikeId,
        BikeRegistrationNumber = f.Bike.RegistrationNumber,
        BikeLabel = $"{f.Bike.Brand} {f.Bike.Model}",
        ServiceId = f.ServiceId,
        InvoiceId = f.Service.Invoice?.Id,
        FollowUpDate = f.FollowUpDate,
        FollowUpType = f.FollowUpType.ToString(),
        Notes = f.Notes,
        Status = f.Status.ToString(),
        NotificationSent = f.NotificationSent,
        CreatedAt = f.CreatedAt,
        CompletedAt = f.CompletedAt
    };
}
