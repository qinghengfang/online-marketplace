using System.Text.Json.Serialization;

namespace MarketplaceAPI.Models;

public class ProductBase
{
    public int Id { get; set; }

    public required string Name { get; set; }

    [JsonConverter(typeof(JsonStringEnumConverter))]
    public ProductCategory Category { get; set; }
}
