using BikeMechanic.Api.Authorization;
using BikeMechanic.Api.Data;
using BikeMechanic.Api.DTOs.Clients;
using BikeMechanic.Api.Entities;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Controllers;

[ApiController]
[Route("api/clients")]
[Authorize(Policy = Policies.MechanicOnly)]
public class ClientsController : ControllerBase
{
    private readonly AppDbContext _db;

    public ClientsController(AppDbContext db)
    {
        _db = db;
    }

    [HttpGet]
    public async Task<ActionResult<List<ClientResponse>>> GetAll()
    {
        var clients = await _db.Clients
            .Include(c => c.Bikes)
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return clients.Select(ToResponse).ToList();
    }

    [HttpGet("search")]
    public async Task<ActionResult<List<ClientResponse>>> Search([FromQuery] string q)
    {
        if (string.IsNullOrWhiteSpace(q))
        {
            return await GetAll();
        }

        var term = q.Trim();

        var clients = await _db.Clients
            .Include(c => c.Bikes)
            .Where(c => c.Name.Contains(term) ||
                        c.Phone.Contains(term) ||
                        c.Bikes.Any(b => b.RegistrationNumber.Contains(term)))
            .OrderByDescending(c => c.CreatedAt)
            .ToListAsync();

        return clients.Select(ToResponse).ToList();
    }

    [HttpGet("{id:int}")]
    public async Task<ActionResult<ClientResponse>> GetById(int id)
    {
        var client = await _db.Clients.Include(c => c.Bikes).FirstOrDefaultAsync(c => c.Id == id);
        if (client is null)
        {
            return NotFound();
        }

        return ToResponse(client);
    }

    [HttpPost]
    public async Task<ActionResult<ClientResponse>> Create(CreateClientRequest request)
    {
        var phone = request.Phone.Trim();

        if (await _db.Users.AnyAsync(u => u.Phone == phone))
        {
            return Conflict(new { message = "A user with this phone number already exists." });
        }

        var temporaryPassword = Guid.NewGuid().ToString("N");

        var user = new User
        {
            Name = request.Name.Trim(),
            Phone = phone,
            Email = request.Email?.Trim(),
            PasswordHash = BCrypt.Net.BCrypt.HashPassword(temporaryPassword),
            Role = UserRole.Client,
            IsActive = true
        };

        var client = new Client
        {
            User = user,
            Name = request.Name.Trim(),
            Phone = phone,
            Email = request.Email?.Trim(),
            Address = request.Address,
            Notes = request.Notes,
            IsActive = true
        };

        _db.Users.Add(user);
        _db.Clients.Add(client);
        await _db.SaveChangesAsync();

        return CreatedAtAction(nameof(GetById), new { id = client.Id }, ToResponse(client));
    }

    [HttpPut("{id:int}")]
    public async Task<ActionResult<ClientResponse>> Update(int id, UpdateClientRequest request)
    {
        var client = await _db.Clients.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
        if (client is null)
        {
            return NotFound();
        }

        var phone = request.Phone.Trim();
        if (phone != client.Phone && await _db.Users.AnyAsync(u => u.Phone == phone && u.Id != client.UserId))
        {
            return Conflict(new { message = "A user with this phone number already exists." });
        }

        client.Name = request.Name.Trim();
        client.Phone = phone;
        client.Email = request.Email?.Trim();
        client.Address = request.Address;
        client.Notes = request.Notes;
        client.IsActive = request.IsActive;
        client.UpdatedAt = DateTime.UtcNow;

        client.User.Name = client.Name;
        client.User.Phone = client.Phone;
        client.User.Email = client.Email;
        client.User.IsActive = client.IsActive;
        client.User.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return ToResponse(client);
    }

    [HttpDelete("{id:int}")]
    public async Task<IActionResult> Deactivate(int id)
    {
        var client = await _db.Clients.Include(c => c.User).FirstOrDefaultAsync(c => c.Id == id);
        if (client is null)
        {
            return NotFound();
        }

        client.IsActive = false;
        client.User.IsActive = false;
        client.UpdatedAt = DateTime.UtcNow;

        await _db.SaveChangesAsync();

        return NoContent();
    }

    private static ClientResponse ToResponse(Client c) => new()
    {
        Id = c.Id,
        Name = c.Name,
        Phone = c.Phone,
        Email = c.Email,
        Address = c.Address,
        Notes = c.Notes,
        IsActive = c.IsActive,
        BikeCount = c.Bikes.Count,
        CreatedAt = c.CreatedAt
    };
}
