using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Hosting.Internal;

namespace MarketplaceAPI.Models;

public class MarketplaceContext : DbContext
{
    public virtual DbSet<ListingProduct> ListingProducts { get; set; }
    public virtual DbSet<ProductInventory> ProductInventory { get; set; }
    public virtual DbSet<User> Users { get; set; }
    public string? DbPath { get; }
    private readonly IWebHostEnvironment env;

    public MarketplaceContext(IWebHostEnvironment env)
          : base()
    {
        this.env = env;
        var folder = Environment.SpecialFolder.LocalApplicationData;
        var path = Environment.GetFolderPath(folder);
        DbPath = System.IO.Path.Join(path, "marketplace.db");
    }

    protected override void OnConfiguring(DbContextOptionsBuilder options)
    {
        if (env.IsEnvironment("test"))
        {
            options.UseInMemoryDatabase("testingDb");
        }
        else
        {
            options.UseSqlite($"Data Source={DbPath}");
        }
    }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<User>()
            .HasMany(e => e.ProductInventory)
            .WithOne()
            .HasForeignKey(e => e.UserId)
            .IsRequired();

        modelBuilder.Entity<ListingProduct>()
            .HasOne(e => e.Seller)
            .WithMany()
            .HasForeignKey(e => e.SellerId)
            .IsRequired();
    }
}