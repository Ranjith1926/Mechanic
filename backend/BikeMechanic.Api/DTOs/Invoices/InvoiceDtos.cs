using System.ComponentModel.DataAnnotations;

namespace BikeMechanic.Api.DTOs.Invoices;

public class InvoiceResponse
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public int BikeId { get; set; }
    public string BikeRegistrationNumber { get; set; } = string.Empty;
    public string BikeLabel { get; set; } = string.Empty;
    public DateTime InvoiceDate { get; set; }
    public decimal LabourAmount { get; set; }
    public decimal SparePartsAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public bool IsVoided { get; set; }
    public DateTime CreatedAt { get; set; }
    public List<InvoiceItemResponse> Items { get; set; } = new();
}

public class InvoiceItemResponse
{
    public int Id { get; set; }
    public string Description { get; set; } = string.Empty;
    public string Category { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal Amount { get; set; }
}

public class CreateInvoiceRequest
{
    [Required]
    public int ServiceId { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Discount { get; set; }

    [Range(0, double.MaxValue)]
    public decimal Tax { get; set; }

    public string? Notes { get; set; }
}
