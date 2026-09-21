namespace BikeMechanic.Api.Entities;

public class Bike
{
    public int Id { get; set; }
    public int ClientId { get; set; }
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
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public Client Client { get; set; } = null!;
    public ICollection<Service> Services { get; set; } = new List<Service>();
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
}
