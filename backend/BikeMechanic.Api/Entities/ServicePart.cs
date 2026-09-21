namespace BikeMechanic.Api.Entities;

public class ServicePart
{
    public int Id { get; set; }
    public int ServiceId { get; set; }
    public int SparePartId { get; set; }
    public int Quantity { get; set; } = 1;
    public decimal UnitPrice { get; set; }
    public decimal TotalPrice { get; set; }
    public SparePartAction Action { get; set; }
    public string? OldPartDescription { get; set; }
    public string? NewPartDescription { get; set; }
    public string? Notes { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Service Service { get; set; } = null!;
    public SparePart SparePart { get; set; } = null!;
}
