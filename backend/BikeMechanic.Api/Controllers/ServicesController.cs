using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Services;
using BikeMechanic.Api.Entities;
using BikeMechanic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/services")]
[Authorize]
public class ServicesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;

    public ServicesController(AppDbContext db, ICurrentUserService currentUser)
    {
        _db = db;
        _currentUser = currentUser;
    }

    [HttpGet]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<List<ServiceResponse>>> GetAll([FromQuery] ServiceStatus? status)
    {
        var query = BaseQuery();

        if (status.HasValue)
        {
            query = query.Where(s => s.Status == status.Value);
        }

        var services = await query.OrderByDescending(s => s.ServiceDate).ToListAsync();
        return services.Select(ToResponse).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ServiceResponse>> GetById(int id)
    {
        var service = await BaseQuery().FirstOrDefaultAsync(s => s.Id == id);
        if (service is null)
        {
            return NotFound();
        }

        if (!await CanAccessService(service))
        {
            return Forbid();
        }

        return ToResponse(service);
    }

    [HttpGet("/api/bikes/{bikeId:int}/services")]
    public async Task<ActionResult<List<ServiceResponse>>> GetByBike(int bikeId)
    {
        var bike = await _db.Bikes.FirstOrDefaultAsync(b => b.Id == bikeId);
        if (bike is null)
        {
            return NotFound();
        }

        if (!await CanAccessBike(bike))
        {
            return Forbid();
        }

        var services = await BaseQuery().Where(s => s.BikeId == bikeId).OrderByDescending(s => s.ServiceDate).ToListAsync();
        return services.Select(ToResponse).ToList();
    }

    [HttpPost]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<ServiceResponse>> Create(CreateServiceRequest request)
    {
        var bike = await _db.Bikes.FirstOrDefaultAsync(b => b.Id == request.BikeId);
        if (bike is null)
        {
            return BadRequest(new { message = "Bike not found." });
        }

        var service = new Service
        {
            BikeId = request.BikeId,
            MechanicId = _currentUser.UserId,
            ServiceDate = request.ServiceDate ?? DateTime.UtcNow,
            Odometer = request.Odometer,
            Complaint = request.Complaint,
            InspectionNotes = request.InspectionNotes,
            WorkPerformed = request.WorkPerformed,
            LabourAmount = request.LabourAmount,
            Status = ServiceStatus.New,
            Notes = request.Notes
        };

        if (request.Odometer > bike.CurrentOdometer)
        {
            bike.CurrentOdometer = request.Odometer;
            bike.UpdatedAt = DateTime.UtcNow;
        }

        _db.Services.Add(service);
        await _db.SaveChangesAsync();

        var created = await BaseQuery().FirstAsync(s => s.Id == service.Id);
        return CreatedAtAction(nameof(GetById), new { id = service.Id }, ToResponse(created));
    }

    [HttpPut("{id:int}")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<ServiceResponse>> Update(int id, UpdateServiceRequest request)
    {
        var service = await _db.Services.Include(s => s.Bike).FirstOrDefaultAsync(s => s.Id == id);
        if (service is null)
        {
            return NotFound();
        }

        service.Odometer = request.Odometer;
        service.Complaint = request.Complaint;
        service.InspectionNotes = request.InspectionNotes;
        service.WorkPerformed = request.WorkPerformed;
        service.LabourAmount = request.LabourAmount;
        service.Notes = request.Notes;

        if (request.Status == ServiceStatus.Completed && service.Status != ServiceStatus.Completed)
        {
            service.CompletedAt = DateTime.UtcNow;
        }
        else if (request.Status != ServiceStatus.Completed)
        {
            service.CompletedAt = null;
        }
        service.Status = request.Status;

        if (request.Odometer > service.Bike.CurrentOdometer)
        {
            service.Bike.CurrentOdometer = request.Odometer;
            service.Bike.UpdatedAt = DateTime.UtcNow;
        }

        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(s => s.Id == id);
        return ToResponse(updated);
    }

    [HttpPost("{id:int}/complete")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<ServiceResponse>> Complete(int id)
    {
        var service = await _db.Services.FirstOrDefaultAsync(s => s.Id == id);
        if (service is null)
        {
            return NotFound();
        }

        service.Status = ServiceStatus.Completed;
        service.CompletedAt = DateTime.UtcNow;
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(s => s.Id == id);
        return ToResponse(updated);
    }

    [HttpPost("{id:int}/parts")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<ServiceResponse>> AddPart(int id, AddServicePartRequest request)
    {
        var service = await _db.Services.FirstOrDefaultAsync(s => s.Id == id);
        if (service is null)
        {
            return NotFound();
        }

        var sparePart = await _db.SpareParts.FindAsync(request.SparePartId);
        if (sparePart is null)
        {
            return BadRequest(new { message = "Spare part not found." });
        }

        var unitPrice = request.UnitPrice ?? sparePart.DefaultPrice;

        var servicePart = new ServicePart
        {
            ServiceId = id,
            SparePartId = request.SparePartId,
            Quantity = request.Quantity,
            UnitPrice = unitPrice,
            TotalPrice = unitPrice * request.Quantity,
            Action = request.Action,
            OldPartDescription = request.OldPartDescription,
            NewPartDescription = request.NewPartDescription,
            Notes = request.Notes
        };

        _db.ServiceParts.Add(servicePart);
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(s => s.Id == id);
        return ToResponse(updated);
    }

    [HttpPut("{id:int}/parts/{partId:int}")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<ServiceResponse>> UpdatePart(int id, int partId, UpdateServicePartRequest request)
    {
        var servicePart = await _db.ServiceParts.FirstOrDefaultAsync(sp => sp.Id == partId && sp.ServiceId == id);
        if (servicePart is null)
        {
            return NotFound();
        }

        servicePart.Quantity = request.Quantity;
        servicePart.UnitPrice = request.UnitPrice;
        servicePart.TotalPrice = request.UnitPrice * request.Quantity;
        servicePart.Action = request.Action;
        servicePart.OldPartDescription = request.OldPartDescription;
        servicePart.NewPartDescription = request.NewPartDescription;
        servicePart.Notes = request.Notes;

        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(s => s.Id == id);
        return ToResponse(updated);
    }

    [HttpDelete("{id:int}/parts/{partId:int}")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<ServiceResponse>> RemovePart(int id, int partId)
    {
        var servicePart = await _db.ServiceParts.FirstOrDefaultAsync(sp => sp.Id == partId && sp.ServiceId == id);
        if (servicePart is null)
        {
            return NotFound();
        }

        _db.ServiceParts.Remove(servicePart);
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(s => s.Id == id);
        return ToResponse(updated);
    }

    private IQueryable<Service> BaseQuery() =>
        _db.Services
            .Include(s => s.Bike).ThenInclude(b => b.Client)
            .Include(s => s.Mechanic)
            .Include(s => s.Invoice)
            .Include(s => s.ServiceParts).ThenInclude(sp => sp.SparePart);

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

    private async Task<bool> CanAccessService(Service service)
    {
        if (_currentUser.IsMechanic)
        {
            return true;
        }

        var ownClientId = await GetOwnClientId();
        return ownClientId.HasValue && ownClientId.Value == service.Bike.ClientId;
    }

    private static ServiceResponse ToResponse(Service s) => new()
    {
        Id = s.Id,
        BikeId = s.BikeId,
        BikeRegistrationNumber = s.Bike.RegistrationNumber,
        BikeLabel = $"{s.Bike.Brand} {s.Bike.Model}",
        ClientId = s.Bike.ClientId,
        ClientName = s.Bike.Client.Name,
        MechanicId = s.MechanicId,
        MechanicName = s.Mechanic.Name,
        ServiceDate = s.ServiceDate,
        Odometer = s.Odometer,
        Complaint = s.Complaint,
        InspectionNotes = s.InspectionNotes,
        WorkPerformed = s.WorkPerformed,
        LabourAmount = s.LabourAmount,
        Status = s.Status.ToString(),
        Notes = s.Notes,
        HasInvoice = s.Invoice != null,
        InvoiceId = s.Invoice?.Id,
        CreatedAt = s.CreatedAt,
        CompletedAt = s.CompletedAt,
        Parts = s.ServiceParts.Select(sp => new ServicePartResponse
        {
            Id = sp.Id,
            SparePartId = sp.SparePartId,
            SparePartName = sp.SparePart.Name,
            Quantity = sp.Quantity,
            UnitPrice = sp.UnitPrice,
            TotalPrice = sp.TotalPrice,
            Action = sp.Action.ToString(),
            OldPartDescription = sp.OldPartDescription,
            NewPartDescription = sp.NewPartDescription,
            Notes = sp.Notes
        }).ToList()
    };
}
