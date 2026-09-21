using System.ComponentModel.DataAnnotations;
using BikeMechanic.Api.Entities;

namespace BikeMechanic.Api.DTOs.Services;

public class ServiceResponse
{
    public int Id { get; set; }
    public int BikeId { get; set; }
    public string BikeRegistrationNumber { get; set; } = string.Empty;
    public string BikeLabel { get; set; } = string.Empty;
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public int MechanicId { get; set; }
    public string MechanicName { get; set; } = string.Empty;
    public DateTime ServiceDate { get; set; }
    public int Odometer { get; set; }
    public string? Complaint { get; set; }
    public string? InspectionNotes { get; set; }
    public string? WorkPerformed { get; set; }
    public decimal LabourAmount { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public bool HasInvoice { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
    public List<ServicePartResponse> Parts { get; set; } = new();
}

public class ServicePartResponse
{
    public int Id { get; set; }
    public int SparePartId { get; set; }
    public string SparePartName { get; set; } = string.Empty;
    public int Quantity { get; set; }
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public string Action { get; set; } = string.Empty;
    public string? OldPartDescription { get; set; }
    public string? NewPartDescription { get; set; }
    public string? Notes { get; set; }
}

public class AddServicePartRequest
{
    [Required]
    public int SparePartId { get; set; }

    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    [Range(0, double.MaxValue)]
    public decimal? UnitPrice { get; set; }

    [Required]
    public SparePartAction Action { get; set; }

    public string? OldPartDescription { get; set; }
    public string? NewPartDescription { get; set; }
    public string? Notes { get; set; }
}

public class UpdateServicePartRequest
{
    [Range(1, int.MaxValue)]
    public int Quantity { get; set; } = 1;

    [Range(0, double.MaxValue)]
    public decimal UnitPrice { get; set; }

    [Required]
    public SparePartAction Action { get; set; }

    public string? OldPartDescription { get; set; }
    public string? NewPartDescription { get; set; }
    public string? Notes { get; set; }
}

public class CreateServiceRequest
{
    [Required]
    public int BikeId { get; set; }

    public DateTime? ServiceDate { get; set; }

    [Range(0, int.MaxValue)]
    public int Odometer { get; set; }

    public string? Complaint { get; set; }
    public string? InspectionNotes { get; set; }
    public string? WorkPerformed { get; set; }

    [Range(0, double.MaxValue)]
    public decimal LabourAmount { get; set; }

    public string? Notes { get; set; }
}

public class UpdateServiceRequest
{
    [Range(0, int.MaxValue)]
    public int Odometer { get; set; }

    public string? Complaint { get; set; }
    public string? InspectionNotes { get; set; }
    public string? WorkPerformed { get; set; }

    [Range(0, double.MaxValue)]
    public decimal LabourAmount { get; set; }

    [Required]
    public ServiceStatus Status { get; set; }

    public string? Notes { get; set; }
}
