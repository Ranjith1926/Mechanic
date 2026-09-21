using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Dashboard;
using BikeMechanic.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/dashboard")]
[Authorize(Policy = Policies.MechanicOnly)]
public class DashboardController : ControllerBase
{
    private readonly AppDbContext _db;

    public DashboardController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet("mechanic")]
    public async Task<ActionResult<MechanicDashboardResponse>> GetMechanicDashboard()
    {
        var today = DateTime.UtcNow.Date;
        var monthStart = new DateTime(today.Year, today.Month, 1, 0, 0, 0, DateTimeKind.Utc);

        var todaySummary = await ComputeSummary(today, today.AddDays(1));
        var monthSummary = await ComputeSummary(monthStart, monthStart.AddMonths(1));

        var followUpsToday = await _db.FollowUps.CountAsync(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date == today);
        var followUpsTomorrow = await _db.FollowUps.CountAsync(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date == today.AddDays(1));
        var followUpsUpcoming = await _db.FollowUps.CountAsync(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date > today.AddDays(1));

        var recentServices = await _db.Services
            .Include(s => s.Bike).ThenInclude(b => b.Client)
            .Include(s => s.Invoice)
            .OrderByDescending(s => s.ServiceDate)
            .Take(10)
            .Select(s => new RecentServiceItem
            {
                ServiceId = s.Id,
                ClientName = s.Bike.Client.Name,
                BikeLabel = s.Bike.Brand + " " + s.Bike.Model,
                BikeRegistrationNumber = s.Bike.RegistrationNumber,
                ServiceDate = s.ServiceDate,
                Status = s.Status.ToString(),
                InvoiceNumber = s.Invoice != null ? s.Invoice.InvoiceNumber : null,
                TotalAmount = s.Invoice != null ? s.Invoice.TotalAmount : null
            })
            .ToListAsync();

        return new MechanicDashboardResponse
        {
            Today = todaySummary,
            Month = monthSummary,
            FollowUpsToday = followUpsToday,
            FollowUpsTomorrow = followUpsTomorrow,
            FollowUpsUpcoming = followUpsUpcoming,
            RecentServices = recentServices
        };
    }

    [HttpGet("revenue")]
    public async Task<ActionResult<RevenueRangeResponse>> GetRevenue(
        [FromQuery] string range = "thisMonth",
        [FromQuery] DateTime? from = null,
        [FromQuery] DateTime? to = null)
    {
        var (rangeFrom, rangeTo) = ResolveRange(range, from, to);

        var summary = await ComputeSummary(rangeFrom, rangeTo);

        var series = await _db.Invoices
            .Where(i => !i.IsVoided && i.InvoiceDate >= rangeFrom && i.InvoiceDate < rangeTo)
            .GroupBy(i => i.InvoiceDate.Date)
            .Select(g => new RevenuePoint { Date = g.Key, Total = g.Sum(i => i.TotalAmount) })
            .OrderBy(p => p.Date)
            .ToListAsync();

        return new RevenueRangeResponse
        {
            From = rangeFrom,
            To = rangeTo.AddDays(-1),
            TotalBilled = summary.TotalBilled,
            LabourRevenue = summary.LabourRevenue,
            SparePartsRevenue = summary.SparePartsRevenue,
            ServicesCount = summary.ServicesCount,
            InvoicesCount = summary.InvoicesCount,
            AverageInvoice = summary.AverageInvoice,
            Series = series
        };
    }

    [HttpGet("services")]
    public async Task<ActionResult<List<RecentServiceItem>>> GetRecentServices([FromQuery] int take = 20)
    {
        var services = await _db.Services
            .Include(s => s.Bike).ThenInclude(b => b.Client)
            .Include(s => s.Invoice)
            .OrderByDescending(s => s.ServiceDate)
            .Take(Math.Clamp(take, 1, 100))
            .Select(s => new RecentServiceItem
            {
                ServiceId = s.Id,
                ClientName = s.Bike.Client.Name,
                BikeLabel = s.Bike.Brand + " " + s.Bike.Model,
                BikeRegistrationNumber = s.Bike.RegistrationNumber,
                ServiceDate = s.ServiceDate,
                Status = s.Status.ToString(),
                InvoiceNumber = s.Invoice != null ? s.Invoice.InvoiceNumber : null,
                TotalAmount = s.Invoice != null ? s.Invoice.TotalAmount : null
            })
            .ToListAsync();

        return services;
    }

    [HttpGet("follow-ups")]
    public async Task<ActionResult<FollowUpCountsResponse>> GetFollowUpCounts()
    {
        var today = DateTime.UtcNow.Date;

        return new FollowUpCountsResponse
        {
            Today = await _db.FollowUps.CountAsync(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date == today),
            Tomorrow = await _db.FollowUps.CountAsync(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date == today.AddDays(1)),
            Upcoming = await _db.FollowUps.CountAsync(f => f.Status == FollowUpStatus.Pending && f.FollowUpDate.Date > today.AddDays(1))
        };
    }

    private async Task<RevenueSummary> ComputeSummary(DateTime fromInclusive, DateTime toExclusive)
    {
        var invoices = _db.Invoices.Where(i => !i.IsVoided && i.InvoiceDate >= fromInclusive && i.InvoiceDate < toExclusive);

        var totalBilled = await invoices.SumAsync(i => (decimal?)i.TotalAmount) ?? 0;
        var labour = await invoices.SumAsync(i => (decimal?)i.LabourAmount) ?? 0;
        var spareParts = await invoices.SumAsync(i => (decimal?)i.SparePartsAmount) ?? 0;
        var invoicesCount = await invoices.CountAsync();

        var servicesCount = await _db.Services.CountAsync(s => s.ServiceDate >= fromInclusive && s.ServiceDate < toExclusive);

        return new RevenueSummary
        {
            TotalBilled = totalBilled,
            LabourRevenue = labour,
            SparePartsRevenue = spareParts,
            ServicesCount = servicesCount,
            InvoicesCount = invoicesCount,
            AverageInvoice = invoicesCount > 0 ? Math.Round(totalBilled / invoicesCount, 2) : 0
        };
    }

    private static (DateTime From, DateTime To) ResolveRange(string range, DateTime? from, DateTime? to)
    {
        var today = DateTime.UtcNow.Date;

        switch (range)
        {
            case "today":
                return (today, today.AddDays(1));
            case "yesterday":
                return (today.AddDays(-1), today);
            case "thisWeek":
                var weekStart = today.AddDays(-(int)today.DayOfWeek + (today.DayOfWeek == DayOfWeek.Sunday ? -6 : 1));
                return (weekStart, weekStart.AddDays(7));
            case "thisMonth":
                var monthStart = new DateTime(today.Year, today.Month, 1);
                return (monthStart, monthStart.AddMonths(1));
            case "lastMonth":
                var lastMonthStart = new DateTime(today.Year, today.Month, 1).AddMonths(-1);
                return (lastMonthStart, lastMonthStart.AddMonths(1));
            case "custom":
                var customFrom = (from ?? today).Date;
                var customTo = (to ?? today).Date.AddDays(1);
                return (customFrom, customTo);
            default:
                var defaultStart = new DateTime(today.Year, today.Month, 1);
                return (defaultStart, defaultStart.AddMonths(1));
        }
    }
}
