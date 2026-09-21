using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Invoices;
using BikeMechanic.Api.Entities;
using BikeMechanic.Api.Services;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/invoices")]
[Authorize]
public class InvoicesController : ControllerBase
{
    private readonly AppDbContext _db;
    private readonly ICurrentUserService _currentUser;
    private readonly IInvoicePdfService _pdfService;
    private readonly INotificationService _notificationService;

    public InvoicesController(
        AppDbContext db,
        ICurrentUserService currentUser,
        IInvoicePdfService pdfService,
        INotificationService notificationService)
    {
        _db = db;
        _currentUser = currentUser;
        _pdfService = pdfService;
        _notificationService = notificationService;
    }

    [HttpGet]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<List<InvoiceResponse>>> GetAll([FromQuery] DateTime? from, [FromQuery] DateTime? to)
    {
        var query = BaseQuery();

        if (from.HasValue)
        {
            query = query.Where(i => i.InvoiceDate >= from.Value.Date);
        }

        if (to.HasValue)
        {
            query = query.Where(i => i.InvoiceDate < to.Value.Date.AddDays(1));
        }

        var invoices = await query.OrderByDescending(i => i.InvoiceDate).ToListAsync();
        return invoices.Select(ToResponse).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<InvoiceResponse>> GetById(int id)
    {
        var invoice = await BaseQuery().FirstOrDefaultAsync(i => i.Id == id);
        if (invoice is null)
        {
            return NotFound();
        }

        if (!await CanAccessInvoice(invoice))
        {
            return Forbid();
        }

        return ToResponse(invoice);
    }

    [HttpGet("{id:int}/pdf")]
    public async Task<IActionResult> GetPdf(int id)
    {
        var invoice = await BaseQuery().FirstOrDefaultAsync(i => i.Id == id);
        if (invoice is null)
        {
            return NotFound();
        }

        if (!await CanAccessInvoice(invoice))
        {
            return Forbid();
        }

        var bytes = _pdfService.Generate(invoice);
        return File(bytes, "application/pdf", $"{invoice.InvoiceNumber}.pdf");
    }

    [HttpPost]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<InvoiceResponse>> Create(CreateInvoiceRequest request)
    {
        var service = await _db.Services
            .Include(s => s.Bike).ThenInclude(b => b.Client)
            .Include(s => s.Invoice)
            .Include(s => s.ServiceParts).ThenInclude(sp => sp.SparePart)
            .FirstOrDefaultAsync(s => s.Id == request.ServiceId);

        if (service is null)
        {
            return BadRequest(new { message = "Service not found." });
        }

        if (service.Invoice is not null)
        {
            return Conflict(new { message = "This service already has an invoice." });
        }

        var billableParts = service.ServiceParts
            .Where(sp => sp.Action is SparePartAction.Added or SparePartAction.Replaced)
            .ToList();

        var sparePartsAmount = billableParts.Sum(sp => sp.TotalPrice);
        var totalAmount = service.LabourAmount + sparePartsAmount - request.Discount + request.Tax;

        var invoice = new Invoice
        {
            InvoiceNumber = string.Empty,
            ServiceId = service.Id,
            ClientId = service.Bike.ClientId,
            BikeId = service.BikeId,
            InvoiceDate = DateTime.UtcNow,
            LabourAmount = service.LabourAmount,
            SparePartsAmount = sparePartsAmount,
            Discount = request.Discount,
            Tax = request.Tax,
            TotalAmount = totalAmount,
            Notes = request.Notes
        };

        if (service.LabourAmount > 0)
        {
            invoice.InvoiceItems.Add(new InvoiceItem
            {
                Description = "General Service",
                Category = InvoiceItemCategory.Labour,
                Quantity = 1,
                UnitPrice = service.LabourAmount,
                Amount = service.LabourAmount
            });
        }

        foreach (var part in billableParts)
        {
            invoice.InvoiceItems.Add(new InvoiceItem
            {
                Description = part.SparePart.Name,
                Category = InvoiceItemCategory.SparePart,
                Quantity = part.Quantity,
                UnitPrice = part.UnitPrice,
                Amount = part.TotalPrice
            });
        }

        _db.Invoices.Add(invoice);
        await _db.SaveChangesAsync();

        invoice.InvoiceNumber = $"INV-{1000 + invoice.Id}";
        await _db.SaveChangesAsync();

        var created = await BaseQuery().FirstAsync(i => i.Id == invoice.Id);
        return CreatedAtAction(nameof(GetById), new { id = invoice.Id }, ToResponse(created));
    }

    [HttpPost("{id:int}/void")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<ActionResult<InvoiceResponse>> Void(int id)
    {
        var invoice = await _db.Invoices.FirstOrDefaultAsync(i => i.Id == id);
        if (invoice is null)
        {
            return NotFound();
        }

        invoice.IsVoided = true;
        await _db.SaveChangesAsync();

        var updated = await BaseQuery().FirstAsync(i => i.Id == id);
        return ToResponse(updated);
    }

    [HttpPost("{id:int}/notify")]
    [Authorize(Policy = Policies.MechanicOnly)]
    public async Task<IActionResult> Notify(int id)
    {
        var invoice = await BaseQuery().FirstOrDefaultAsync(i => i.Id == id);
        if (invoice is null)
        {
            return NotFound();
        }

        var message = $"Your invoice {invoice.InvoiceNumber} for {invoice.Bike.Brand} {invoice.Bike.Model} " +
                      $"has been generated.\n\nTotal Amount: Rs. {invoice.TotalAmount:N2}";

        await _notificationService.CreateAsync(
            invoice.ClientId,
            "Invoice Generated",
            message,
            NotificationType.InvoiceCreated,
            invoice.Id);

        return NoContent();
    }

    private IQueryable<Invoice> BaseQuery() =>
        _db.Invoices
            .Include(i => i.Client)
            .Include(i => i.Bike)
            .Include(i => i.InvoiceItems);

    private async Task<bool> CanAccessInvoice(Invoice invoice)
    {
        if (_currentUser.IsMechanic)
        {
            return true;
        }

        var ownClientId = await _db.Clients
            .Where(c => c.UserId == _currentUser.UserId)
            .Select(c => (int?)c.Id)
            .FirstOrDefaultAsync();

        return ownClientId.HasValue && ownClientId.Value == invoice.ClientId;
    }

    private static InvoiceResponse ToResponse(Invoice i) => new()
    {
        Id = i.Id,
        InvoiceNumber = i.InvoiceNumber,
        ServiceId = i.ServiceId,
        ClientId = i.ClientId,
        ClientName = i.Client.Name,
        ClientPhone = i.Client.Phone,
        BikeId = i.BikeId,
        BikeRegistrationNumber = i.Bike.RegistrationNumber,
        BikeLabel = $"{i.Bike.Brand} {i.Bike.Model}",
        InvoiceDate = i.InvoiceDate,
        LabourAmount = i.LabourAmount,
        SparePartsAmount = i.SparePartsAmount,
        Discount = i.Discount,
        Tax = i.Tax,
        TotalAmount = i.TotalAmount,
        Notes = i.Notes,
        IsVoided = i.IsVoided,
        CreatedAt = i.CreatedAt,
        Items = i.InvoiceItems.Select(item => new InvoiceItemResponse
        {
            Id = item.Id,
            Description = item.Description,
            Category = item.Category.ToString(),
            Quantity = item.Quantity,
            UnitPrice = item.UnitPrice,
            Amount = item.Amount
        }).ToList()
    };
}
