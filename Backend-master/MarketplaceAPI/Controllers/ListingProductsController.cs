using MarketplaceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;
using Microsoft.VisualBasic;

namespace MarketplaceAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ListingProductsController : ControllerBase
{
    private readonly ILogger<ListingProductsController> _logger;

    private readonly MarketplaceContext _context;

    public ListingProductsController(ILogger<ListingProductsController> logger, MarketplaceContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet]
    public async Task<ActionResult<IEnumerable<ListingProduct>>> GetListingProducts(int limit = 0, int offset = 0, string? name = null, string? seller = null)
    {
        var t = _context.ListingProducts.Include(p => p.Seller).AsQueryable();
        if (name != null)
        {
            t = t.Where(p => p.Name == name);
        }

        if (seller != null)
        {
            t = t.Where(p => p.Seller.DisplayName == seller);
        }

        t = t.OrderBy(p => p.Id).Skip(offset);
        if (limit != 0)
        {
            t = t.Take(limit);
        }
        return await t.ToListAsync();
    }

    [HttpPost("{id}/purchase")]
    public async Task<ActionResult<ListingProduct>> PurchaseListProduct(int id)
    {
        var userId = HttpContext.User.Identity?.Name;
        if (userId == null)
        {
            throw new UnauthorizedAccessException();
        }

        var user = await _context.Users.FirstOrDefaultAsync(u => u.Id == userId);
        if (user == null)
        {
            throw new KeyNotFoundException($"User with ID {userId} does not exist.");
        }

        var product = await _context.ListingProducts.FirstOrDefaultAsync(p => p.Id == id);
        if (product == null)
        {
            throw new KeyNotFoundException($"Product with ID {userId} does not exist.");
        }

        ProductInventory productInventory = new ProductInventory()
        {
            UserId = userId,
            Name = product.Name,
            Category = product.Category,
        };

        if (user.Balance < product.Price)
        {
            throw new Exception($"Your balance is insufficent to purchase \"{product.Name}\"");
        }

        user.Balance -= product.Price;
        user.ProductInventory.Add(productInventory);
        _context.ListingProducts.Remove(product);
        await _context.SaveChangesAsync();
        return Ok();
    }

    [HttpPost]
    public async Task<ActionResult<ListingProduct>> ListProduct(ListingProduct listingProduct, int userInventoryProductId)
    {
        var userId = HttpContext.User.Identity?.Name;
        ProductInventory product = await _context.ProductInventory.FirstAsync(p => p.Id == userInventoryProductId);
        if (product.UserId != userId)
        {
            throw new UnauthorizedAccessException();
        }

        _context.ProductInventory.Remove(product);
        _context.ListingProducts.Add(listingProduct);
        await _context.SaveChangesAsync();
        return CreatedAtAction(
            nameof(ListProduct),
            new { id = listingProduct.Id },
            listingProduct);
    }
}

