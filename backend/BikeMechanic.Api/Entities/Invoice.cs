namespace BikeMechanic.Api.Entities;

public class Invoice
{
    public int Id { get; set; }
    public string InvoiceNumber { get; set; } = string.Empty;
    public int ServiceId { get; set; }
    public int ClientId { get; set; }
    public int BikeId { get; set; }
    public DateTime InvoiceDate { get; set; } = DateTime.UtcNow;
    public decimal LabourAmount { get; set; }
    public decimal SparePartsAmount { get; set; }
    public decimal Discount { get; set; }
    public decimal Tax { get; set; }
    public decimal TotalAmount { get; set; }
    public string? Notes { get; set; }
    public string? PdfUrl { get; set; }
    public bool IsVoided { get; set; }
    public DateTime CreatedAt { get; set; } = DateTime.UtcNow;

    public Service Service { get; set; } = null!;
    public Client Client { get; set; } = null!;
    public Bike Bike { get; set; } = null!;
    public ICollection<InvoiceItem> InvoiceItems { get; set; } = new List<InvoiceItem>();
}
