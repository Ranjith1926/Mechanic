using System.ComponentModel.DataAnnotations;
using BikeMechanic.Api.Entities;

namespace BikeMechanic.Api.DTOs.FollowUps;

public class FollowUpResponse
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string ClientPhone { get; set; } = string.Empty;
    public int BikeId { get; set; }
    public string BikeRegistrationNumber { get; set; } = string.Empty;
    public string BikeLabel { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public int? InvoiceId { get; set; }
    public DateTime FollowUpDate { get; set; }
    public string FollowUpType { get; set; } = string.Empty;
    public string? Notes { get; set; }
    public string Status { get; set; } = string.Empty;
    public bool NotificationSent { get; set; }
    public DateTime CreatedAt { get; set; }
    public DateTime? CompletedAt { get; set; }
}

public class CreateFollowUpRequest
{
    [Required]
    public int ServiceId { get; set; }

    [Required]
    public DateTime FollowUpDate { get; set; }

    [Required]
    public FollowUpType FollowUpType { get; set; }

    public string? Notes { get; set; }
}

public class UpdateFollowUpRequest
{
    [Required]
    public DateTime FollowUpDate { get; set; }

    [Required]
    public FollowUpType FollowUpType { get; set; }

    public string? Notes { get; set; }

    [Required]
    public FollowUpStatus Status { get; set; }
}
