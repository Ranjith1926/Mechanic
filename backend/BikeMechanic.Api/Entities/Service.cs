namespace BikeMechanic.Api.Entities;

public class Service
{
    public int Id { get; set; }
    public int BikeId { get; set; }
    public int MechanicId { get; set; }
    public DateTime ServiceDate { get; set; } = DateTime.UtcNow;
    public int Odometer { get; set; }
    public string? Complaint { get; set; }
    public string? InspectionNotes { get; set; }
    public string? WorkPerformed { get; set; }
    public decimal LabourAmount { get; set; }
    public ServiceStatus Status { get; set; } = ServiceStatus.New;
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime? CompletedAt { get; set; }

    public Bike Bike { get; set; } = null!;
    public User Mechanic { get; set; } = null!;
    public ICollection<ServicePart> ServiceParts { get; set; } = new List<ServicePart>();
    public Invoice? Invoice { get; set; }
    public ICollection<FollowUp> FollowUps { get; set; } = new List<FollowUp>();
}
