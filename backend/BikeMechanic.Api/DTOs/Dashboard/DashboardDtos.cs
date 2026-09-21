namespace BikeMechanic.Api.DTOs.Dashboard;

public class RevenueSummary
{
    public decimal TotalBilled { get; set; }
    public decimal LabourRevenue { get; set; }
    public decimal SparePartsRevenue { get; set; }
    public int ServicesCount { get; set; }
    public int InvoicesCount { get; set; }
    public decimal AverageInvoice { get; set; }
}

public class RecentServiceItem
{
    public int ServiceId { get; set; }
    public string ClientName { get; set; } = string.Empty;
    public string BikeLabel { get; set; } = string.Empty;
    public string BikeRegistrationNumber { get; set; } = string.Empty;
    public DateTime ServiceDate { get; set; }
    public string Status { get; set; } = string.Empty;
    public string? InvoiceNumber { get; set; }
    public decimal? TotalAmount { get; set; }
}

public class MechanicDashboardResponse
{
    public RevenueSummary Today { get; set; } = new();
    public RevenueSummary Month { get; set; } = new();
    public int FollowUpsToday { get; set; }
    public int FollowUpsTomorrow { get; set; }
    public int FollowUpsUpcoming { get; set; }
    public List<RecentServiceItem> RecentServices { get; set; } = new();
}

public class RevenuePoint
{
    public DateTime Date { get; set; }
    public decimal Total { get; set; }
}

public class RevenueRangeResponse
{
    public DateTime From { get; set; }
    public DateTime To { get; set; }
    public decimal TotalBilled { get; set; }
    public decimal LabourRevenue { get; set; }
    public decimal SparePartsRevenue { get; set; }
    public int ServicesCount { get; set; }
    public int InvoicesCount { get; set; }
    public decimal AverageInvoice { get; set; }
    public List<RevenuePoint> Series { get; set; } = new();
}

public class FollowUpCountsResponse
{
    public int Today { get; set; }
    public int Tomorrow { get; set; }
    public int Upcoming { get; set; }
}
