using System.ComponentModel.DataAnnotations;

namespace BikeMechanic.Api.DTOs.SpareParts;

public class SparePartResponse
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? PartNumber { get; set; }
    public decimal DefaultPrice { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; }
    public DateTime CreatedAt { get; set; }
}

public class CreateSparePartRequest
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public string? Brand { get; set; }
    public string? PartNumber { get; set; }

    [Range(0, double.MaxValue)]
    public decimal DefaultPrice { get; set; }

    public string? Description { get; set; }
}

public class UpdateSparePartRequest
{
    [Required, MaxLength(150)]
    public string Name { get; set; } = string.Empty;

    public string? Brand { get; set; }
    public string? PartNumber { get; set; }

    [Range(0, double.MaxValue)]
    public decimal DefaultPrice { get; set; }

    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
}

public class SparePartHistoryItem
{
    public int ServiceId { get; set; }
    public DateTime ServiceDate { get; set; }
    public string BikeRegistrationNumber { get; set; } = string.Empty;
    public string ClientName { get; set; } = string.Empty;
    public string Action { get; set; } = string.Empty;
    public string? OldPartDescription { get; set; }
    public string? NewPartDescription { get; set; }
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
}
