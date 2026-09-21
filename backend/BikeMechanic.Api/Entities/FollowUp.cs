namespace BikeMechanic.Api.Entities;

public class FollowUp
{
    public int Id { get; set; }
    public int ClientId { get; set; }
    public int BikeId { get; set; }
    public int ServiceId { get; set; }
    public DateTime FollowUpDate { get; set; }
    public FollowUpType FollowUpType { get; set; }
    public string? Notes { get; set; }
    public FollowUpStatus Status { get; set; } = FollowUpStatus.Pending;
    public bool NotificationSent { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public Client Client { get; set; } = null!;
    public Bike Bike { get; set; } = null!;
    public Service Service { get; set; } = null!;
}
