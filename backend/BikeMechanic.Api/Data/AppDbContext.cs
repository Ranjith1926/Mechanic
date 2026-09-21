using BikeMechanic.Api.Entities;
using Microsoft.EntityFrameworkCore;

namespace BikeMechanic.Api.Data;

public class AppDbContext : DbContext
{
    public AppDbContext(DbContextOptions<AppDbContext> options) : base(options)
    {
    }

    public DbSet<User> Users => Set<User>();
    public DbSet<Client> Clients => Set<Client>();
    public DbSet<Bike> Bikes => Set<Bike>();
    public DbSet<Service> Services => Set<Service>();
    public DbSet<SparePart> SpareParts => Set<SparePart>();
    public DbSet<ServicePart> ServiceParts => Set<ServicePart>();
    public DbSet<Invoice> Invoices => Set<Invoice>();
    public DbSet<InvoiceItem> InvoiceItems => Set<InvoiceItem>();
    public DbSet<FollowUp> FollowUps => Set<FollowUp>();
    public DbSet<Notification> Notifications => Set<Notification>();
    public DbSet<RefreshToken> RefreshTokens => Set<RefreshToken>();

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>(entity =>
        {
            entity.HasIndex(u => u.Phone).IsUnique();
            entity.Property(u => u.Role).HasConversion<string>().HasMaxLength(20);
            entity.Property(u => u.Name).HasMaxLength(150);
            entity.Property(u => u.Phone).HasMaxLength(20);
            entity.Property(u => u.Email).HasMaxLength(150);
        });

        modelBuilder.Entity<Client>(entity =>
        {
            entity.HasOne(c => c.User)
                .WithOne(u => u.Client)
                .HasForeignKey<Client>(c => c.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(c => c.Name).HasMaxLength(150);
            entity.Property(c => c.Phone).HasMaxLength(20);
        });

        modelBuilder.Entity<Bike>(entity =>
        {
            entity.HasIndex(b => b.RegistrationNumber).IsUnique();
            entity.HasOne(b => b.Client)
                .WithMany(c => c.Bikes)
                .HasForeignKey(b => b.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(b => b.RegistrationNumber).HasMaxLength(30);
            entity.Property(b => b.Brand).HasMaxLength(80);
            entity.Property(b => b.Model).HasMaxLength(80);
        });

        modelBuilder.Entity<Service>(entity =>
        {
            entity.HasOne(s => s.Bike)
                .WithMany(b => b.Services)
                .HasForeignKey(s => s.BikeId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(s => s.Mechanic)
                .WithMany()
                .HasForeignKey(s => s.MechanicId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(s => s.Status).HasConversion<string>().HasMaxLength(20);
            entity.Property(s => s.LabourAmount).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<SparePart>(entity =>
        {
            entity.Property(sp => sp.Name).HasMaxLength(150);
            entity.Property(sp => sp.DefaultPrice).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<ServicePart>(entity =>
        {
            entity.HasOne(sp => sp.Service)
                .WithMany(s => s.ServiceParts)
                .HasForeignKey(sp => sp.ServiceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasOne(sp => sp.SparePart)
                .WithMany(p => p.ServiceParts)
                .HasForeignKey(sp => sp.SparePartId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(sp => sp.Action).HasConversion<string>().HasMaxLength(20);
            entity.Property(sp => sp.UnitPrice).HasColumnType("decimal(10,2)");
            entity.Property(sp => sp.TotalPrice).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<Invoice>(entity =>
        {
            entity.HasIndex(i => i.InvoiceNumber).IsUnique();
            entity.HasOne(i => i.Service)
                .WithOne(s => s.Invoice)
                .HasForeignKey<Invoice>(i => i.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(i => i.Client)
                .WithMany()
                .HasForeignKey(i => i.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(i => i.Bike)
                .WithMany()
                .HasForeignKey(i => i.BikeId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(i => i.LabourAmount).HasColumnType("decimal(10,2)");
            entity.Property(i => i.SparePartsAmount).HasColumnType("decimal(10,2)");
            entity.Property(i => i.Discount).HasColumnType("decimal(10,2)");
            entity.Property(i => i.Tax).HasColumnType("decimal(10,2)");
            entity.Property(i => i.TotalAmount).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<InvoiceItem>(entity =>
        {
            entity.HasOne(ii => ii.Invoice)
                .WithMany(i => i.InvoiceItems)
                .HasForeignKey(ii => ii.InvoiceId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(ii => ii.Category).HasConversion<string>().HasMaxLength(20);
            entity.Property(ii => ii.UnitPrice).HasColumnType("decimal(10,2)");
            entity.Property(ii => ii.Amount).HasColumnType("decimal(10,2)");
        });

        modelBuilder.Entity<FollowUp>(entity =>
        {
            entity.HasOne(f => f.Client)
                .WithMany(c => c.FollowUps)
                .HasForeignKey(f => f.ClientId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(f => f.Bike)
                .WithMany(b => b.FollowUps)
                .HasForeignKey(f => f.BikeId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.HasOne(f => f.Service)
                .WithMany(s => s.FollowUps)
                .HasForeignKey(f => f.ServiceId)
                .OnDelete(DeleteBehavior.Restrict);
            entity.Property(f => f.FollowUpType).HasConversion<string>().HasMaxLength(30);
            entity.Property(f => f.Status).HasConversion<string>().HasMaxLength(20);
        });

        modelBuilder.Entity<Notification>(entity =>
        {
            entity.HasOne(n => n.Client)
                .WithMany(c => c.Notifications)
                .HasForeignKey(n => n.ClientId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.Property(n => n.Type).HasConversion<string>().HasMaxLength(30);
        });

        modelBuilder.Entity<RefreshToken>(entity =>
        {
            entity.HasOne(rt => rt.User)
                .WithMany()
                .HasForeignKey(rt => rt.UserId)
                .OnDelete(DeleteBehavior.Cascade);
            entity.HasIndex(rt => rt.TokenHash);
        });
    }
}
