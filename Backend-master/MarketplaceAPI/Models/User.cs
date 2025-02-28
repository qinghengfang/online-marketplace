namespace MarketplaceAPI.Models;

public class User : IEquatable<object>
{
    public required string Id { get; set; }

    public string? DisplayName { get; set; }

    public Decimal Balance { get; set; }

    public DateTime RegisteredDateTime { get; set; }

    public DateTime LastLogonDateTime { get; set; }

    public ICollection<ProductInventory> ProductInventory { get; } = new List<ProductInventory>();

    override public bool Equals(object? other)
    {
        if (other is User otherUser && 
            Id == otherUser?.Id && 
            DisplayName == otherUser?.DisplayName)
        {
            return true;
        }

        return false;
    }

    public override int GetHashCode()
    {
        return HashCode.Combine(Id, DisplayName);
    }
}
