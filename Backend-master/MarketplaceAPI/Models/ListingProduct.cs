namespace MarketplaceAPI.Models;

public class ListingProduct : ProductBase
{
    public decimal Price { get; set; }

    public string? Description { get; set; }

    public required string SellerId { get; set; }

    public User? Seller { get; set; } = null!;
}
