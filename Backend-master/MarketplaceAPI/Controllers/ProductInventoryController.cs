using MarketplaceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;

namespace MarketplaceAPI.Controllers;

[ApiController]
[Route("api/v{version:apiVersion}/[controller]")]
public class ProductInventoryController : ControllerBase
{
    private readonly ILogger<ProductInventoryController> _logger;

    private readonly MarketplaceContext _context;

    public ProductInventoryController(ILogger<ProductInventoryController> logger, MarketplaceContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpPost]
    public async Task<ActionResult<User>> PostProductInventory(ProductInventory productInventory)
    {
        _context.ProductInventory.Add(productInventory);
        await _context.SaveChangesAsync();
        return CreatedAtAction(
            nameof(PostProductInventory),
            new {id = productInventory.Id},
            productInventory);
    }
}