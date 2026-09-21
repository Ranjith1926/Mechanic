using System.ComponentModel.DataAnnotations;

namespace BikeMechanic.Api.DTOs.Bikes;

public class BikeResponse
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string RegistrationNumber { get; set; } = string.Empty;
    public string Brand { get; set; } = string.Empty;
    public string Model { get; set; } = string.Empty;
    public string? Variant { get; set; }
    public int? ManufacturingYear { get; set; }
    public string? Colour { get; set; }
    public int CurrentOdometer { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Notes { get; set; }
    public DateTime? LastServiceDate { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateBikeRequest
{
    [Required]
    public int ClientId { get; set; }

    [Required, MaxLength(30)]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Brand { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Model { get; set; } = string.Empty;

    public string? Variant { get; set; }
    public int? ManufacturingYear { get; set; }
    public string? Colour { get; set; }
    public int CurrentOdometer { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Notes { get; set; }
}

public class UpdateBikeRequest
{
    [Required, MaxLength(30)]
    public string RegistrationNumber { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Brand { get; set; } = string.Empty;

    [Required, MaxLength(80)]
    public string Model { get; set; } = string.Empty;

    public string? Variant { get; set; }
    public int? ManufacturingYear { get; set; }
    public string? Colour { get; set; }
    public int CurrentOdometer { get; set; }
    public DateTime? PurchaseDate { get; set; }
    public string? PhotoUrl { get; set; }
    public string? Notes { get; set; }
}

public class BikeHistoryItem
{
    public int ServiceId { get; set; }
    public DateTime ServiceDate { get; set; }
    public int Odometer { get; set; }
    public string? Complaint { get; set; }
    public string? WorkPerformed { get; set; }
    public string Status { get; set; } = string.Empty;
    public decimal LabourAmount { get; set; }
    public List<BikeHistoryPartItem> Parts { get; set; } = new();
    public int? InvoiceId { get; set; }
    public string? InvoiceNumber { get; set; }
    public decimal? InvoiceTotal { get; set; }
}

public class BikeHistoryPartItem
{
    public string PartName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldPartDescription { get; set; }
    public string? NewPartDescription { get; set; }
}
