using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.SpareParts;
using BikeMechanic.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/spare-parts")]
[Authorize(Policy = Policies.MechanicOnly)]
public class SparePartsController : ControllerBase
{
    private readonly AppDbContext _db;

    public SparePartsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<SparePartResponse>>> GetAll([FromQuery] bool includeInactive = false, [FromQuery] string? q = null)
    {
        var query = _db.SpareParts.AsQueryable();

        if (!includeInactive)
        {
            query = query.Where(sp => sp.IsActive);
        }

        if (!string.IsNullOrWhiteSpace(q))
        {
            var term = q.Trim();
            query = query.Where(sp => sp.Name.Contains(term) || (sp.Brand != null && sp.Brand.Contains(term)));
        }

        var parts = await query.OrderBy(sp => sp.Name).ToListAsync();
        return parts.Select(ToResponse).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<SparePartResponse>> GetById(int id)
    {
        var part = await _db.SpareParts.FindAsync(id);
        if (part is null)
        {
            return NotFound();
        }

        return ToResponse(part);
    }

    [HttpGet("{id:int}/history")]
    public async Task<ActionResult<List<SparePartHistoryItem>>> GetHistory(int id)
    {
        var exists = await _db.SpareParts.AnyAsync(sp => sp.Id == id);
        if (!exists)
        {
            return NotFound();
        }

        var usages = await _db.ServiceParts
            .Include(sp => sp.Service).ThenInclude(s => s.Bike).ThenInclude(b => b.Client)
            .Where(sp => sp.SparePartId == id)
            .OrderByDescending(sp => sp.Service.ServiceDate)
            .ToListAsync();

        return usages.Select(sp => new SparePartHistoryItem
        {
            ServiceId = sp.ServiceId,
            ServiceDate = sp.Service.ServiceDate,
            BikeRegistrationNumber = sp.Service.Bike.RegistrationNumber,
            ClientName = sp.Service.Bike.Client.Name,
            Action = sp.Action.ToString(),
            OldPartDescription = sp.OldPartDescription,
            NewPartDescription = sp.NewPartDescription,
            Quantity = sp.Quantity,
            UnitPrice = sp.UnitPrice,
            TotalPrice = sp.TotalPrice
        }).ToList();
    }

    [HttpPost]
    public async Task<ActionResult<SparePartResponse>> Create(CreateSparePartRequest request)
    {
        var part = new SparePart
        {
            Name = request.Name.Trim(),
            Brand = request.Brand,
            PartNumber = request.PartNumber,
            DefaultPrice = request.DefaultPrice,
            Description = request.Description,
            IsActive = true
        };

        _db.SpareParts.Add(part);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = part.Id }, ToResponse(part));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<SparePartResponse>> Update(int id, UpdateSparePartRequest request)
    {
        var part = await _db.SpareParts.FindAsync(id);
        if (part is null)
        {
            return NotFound();
        }

        part.Name = request.Name.Trim();
        part.Brand = request.Brand;
        part.PartNumber = request.PartNumber;
        part.DefaultPrice = request.DefaultPrice;
        part.Description = request.Description;
        part.IsActive = request.IsActive;
        part.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ToResponse(part);
    }

    private static SparePartResponse ToResponse(SparePart sp) => new()
    {
        Id = sp.Id,
        Name = sp.Name,
        Brand = sp.Brand,
        PartNumber = sp.PartNumber,
        DefaultPrice = sp.DefaultPrice,
        Description = sp.Description,
        IsActive = sp.IsActive,
        CreatedAt = sp.CreatedAt
    };
}
