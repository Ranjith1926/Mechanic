using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Bikes;
using BikeMechanic.Api.Entities;
using BikeMechanic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/bikes")]
[Authorize]
public class BikesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public BikesController(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    public async Task<ActionResult<List<BikeResponse>>> GetAll([FromQuery] int? clientId, [FromQuery] string? q)
    {
        var query = _db.Bikes.Include(b => b.Client).AsQueryable();

        if (_currentUser.IsClient)
        {
            var ownClientId = await GetOwnClientId();
            if (ownClientId is null)
            {
                return Forbid();
            }
            query = query.Where(b => b.ClientId == ownClientId.Value);
        }
        else if (clientId.HasValue)
        {
            query = query.Where(b => b.ClientId == clientId.Value);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(b => b.RegistrationNumber.Contains(term) ||
                                      b.Brand.Contains(term) ||
                                      b.Model.Contains(term));
        }

        var bikes = await query.OrderByDescending(b => b.CreatedAt).ToListAsync();
        var lastServiceDates = await GetLastServiceDates(bikes.Select(b => b.Id));

        return bikes.Select(b => ToResponse(b, lastServiceDates.GetValueOrDefault(b.Id))).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<BikeResponse>> GetById(int id)
    {
        var bike = await _db.Bikes.Include(b => b.Client).FirstOrDefaultAsync(b => b.Id == id);
        if (bike is null)
        {
            return NotFound();
        }

        if (!await CanAccessBike(bike))
        {
            return Forbid();
        }

        var lastServiceDates = await GetLastServiceDates(new[] { id });
        return ToResponse(bike, lastServiceDates.GetValueOrDefault(id));
    }

    [HttpGet("{id:int}/history")]
    public async Task<ActionResult<List<BikeHistoryItem>>> GetHistory(int id)
    {
        var bike = await _db.Bikes.FirstOrDefaultAsync(b => b.Id == id);
        if (bike is null)
        {
            return NotFound();
        }

        if (!await CanAccessBike(bike))
        {
            return Forbid();
        }

        var services = await _db.Services
            .Include(s => s.ServiceParts).ThenInclude(sp => sp.SparePart)
            .Include(s => s.Invoice)
            .Where(s => s.BikeId == id)
            .OrderByDescending(s => s.ServiceDate)
            .ToListAsync();

        return services.Select(s => new BikeHistoryItem
        {
            ServiceId = s.Id,
            ServiceDate = s.ServiceDate,
            Odometer = s.Odometer,
            Complaint = s.Complaint,
            WorkPerformed = s.WorkPerformed,
            Status = s.Status.ToString(),
            LabourAmount = s.LabourAmount,
            InvoiceId = s.Invoice?.Id,
            InvoiceNumber = s.Invoice?.InvoiceNumber,
            InvoiceTotal = s.Invoice?.TotalAmount,
            Parts = s.ServiceParts.Select(sp => new BikeHistoryPartItem
            {
                PartName = sp.SparePart.Name,
                Action = sp.Action.ToString(),
                OldPartDescription = sp.OldPartDescription,
                NewPartDescription = sp.NewPartDescription
            }).ToList()
        }).ToList();
    }

    [HttpPost]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<BikeResponse>> Create(CreateBikeRequest request)
    {
        var client = await _db.Clients.FindAsync(request.ClientId);
        if (client is null)
        {
            return BadRequest(new { message = "Client not found." });
        }

        var regNumber = request.RegistrationNumber.Trim().ToUpperInvariant();
        if (await _db.Bikes.AnyAsync(b => b.RegistrationNumber == regNumber))
        {
            return Conflict(new { message = "A bike with this registration number already exists." });
        }

        var bike = new Bike
        {
            ClientId = request.ClientId,
            RegistrationNumber = regNumber,
            Brand = request.Brand.Trim(),
            Model = request.Model.Trim(),
            Variant = request.Variant,
            ManufacturingYear = request.ManufacturingYear,
            Colour = request.Colour,
            CurrentOdometer = request.CurrentOdometer,
            PurchaseDate = request.PurchaseDate,
            PhotoUrl = request.PhotoUrl,
            Notes = request.Notes
        };

        _db.Bikes.Add(bike);
        await _db.SaveChangesAsync();

        bike.Client = client;
        return CreatedAtAction(nameof(GetById), new { id = bike.Id }, ToResponse(bike, null));
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<BikeResponse>> Update(int id, UpdateBikeRequest request)
    {
        var bike = await _db.Bikes.Include(b => b.Client).FirstOrDefaultAsync(b => b.Id == id);
        if (bike is null)
        {
            return NotFound();
        }

        var regNumber = request.RegistrationNumber.Trim().ToUpperInvariant();
        if (regNumber != bike.RegistrationNumber &&
            await _db.Bikes.AnyAsync(b => b.RegistrationNumber == regNumber && b.Id != id))
        {
            return Conflict(new { message = "A bike with this registration number already exists." });
        }

        bike.RegistrationNumber = regNumber;
        bike.Brand = request.Brand.Trim();
        bike.Model = request.Model.Trim();
        bike.Variant = request.Variant;
        bike.ManufacturingYear = request.ManufacturingYear;
        bike.Colour = request.Colour;
        bike.CurrentOdometer = request.CurrentOdometer;
        bike.PurchaseDate = request.PurchaseDate;
        bike.PhotoUrl = request.PhotoUrl;
        bike.Notes = request.Notes;
        bike.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        var lastServiceDates = await GetLastServiceDates(new[] { id });
        return ToResponse(bike, lastServiceDates.GetValueOrDefault(id));
    }

    [HttpDelete("{id:int}")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<IActionResult> Delete(int id)
    {
        var bike = await _db.Bikes.FirstOrDefaultAsync(b => b.Id == id);
        if (bike is null)
        {
            return NotFound();
        }

        var hasServices = await _db.Services.AnyAsync(s => s.BikeId == id);
        if (hasServices)
        {
            return BadRequest(new { message = "This bike has service history and cannot be deleted." });
        }

        _db.Bikes.Remove(bike);
        await _db.SaveChangesAsync();

        return NoContent();
    }

    private async Task<int?> GetOwnClientId()
    {
        var client = await _db.Clients.FirstOrDefaultAsync(c => c.UserId == _currentUser.UserId);
        return client?.Id;
    }

    private async Task<bool> CanAccessBike(Bike bike)
    {
        if (_currentUser.IsMechanic)
        {
            return true;
        }

        var ownClientId = await GetOwnClientId();
        return ownClientId.HasValue && ownClientId.Value == bike.ClientId;
    }

    private async Task<Dictionary<int, DateTime>> GetLastServiceDates(IEnumerable<int> bikeIds)
    {
        var ids = bikeIds.ToList();
        if (ids.Count == 0)
        {
            return new Dictionary<int, DateTime>();
        }

        return await _db.Services
            .Where(s => ids.Contains(s.BikeId))
            .GroupBy(s => s.BikeId)
            .Select(g => new { BikeId = g.Key, LastServiceDate = g.Max(s => s.ServiceDate) })
            .ToDictionaryAsync(x => x.BikeId, x => x.LastServiceDate);
    }

    private static BikeResponse ToResponse(Bike b, DateTime? lastServiceDate) => new()
    {
        Id = b.Id,
        ClientId = b.ClientId,
        ClientName = b.Client.Name,
        RegistrationNumber = b.RegistrationNumber,
        Brand = b.Brand,
        Model = b.Model,
        Variant = b.Variant,
        ManufacturingYear = b.ManufacturingYear,
        Colour = b.Colour,
        CurrentOdometer = b.CurrentOdometer,
        PurchaseDate = b.PurchaseDate,
        PhotoUrl = b.PhotoUrl,
        Notes = b.Notes,
        LastServiceDate = lastServiceDate,
        CreatedAt = b.CreatedAt
    };
}
