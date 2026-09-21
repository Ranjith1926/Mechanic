namespace BikeMechanic.Api.Entities;

public class SparePart
{
    public int Id { get; set; }
    public string Name { get; set; } = string.Empty;
    public string? Brand { get; set; }
    public string? PartNumber { get; set; }
    public decimal DefaultPrice { get; set; }
    public string? Description { get; set; }
    public bool IsActive { get; set; } = true;
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;
    public DateTime UpdatedAt { get; set; } = DateTime.UtcNow;

    public ICollection<ServicePart> ServiceParts { get; set; } = new List<ServicePart>();
}
