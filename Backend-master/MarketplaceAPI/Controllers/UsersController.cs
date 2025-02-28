using Asp.Versioning;
using MarketplaceAPI.Models;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Identity.Web.Resource;

namespace MarketplaceAPI.Controllers;

[Authorize]
[ApiController]
[ApiVersion( 1.0 )]
[Route("api/v{version:apiVersion}/[controller]")]
public class UsersController : ControllerBase
{
    public const string DisplayNameClaimType = "displayName";
    private readonly ILogger<UsersController> _logger;
    private readonly MarketplaceContext _context;

    public UsersController(ILogger<UsersController> logger, MarketplaceContext context)
    {
        _logger = logger;
        _context = context;
    }

    [HttpGet, MapToApiVersion( 1.0 )]
    [RequiredScope("users.read")]
    public async Task<ActionResult<IEnumerable<User>>> GetUsers()
    {
        return await _context.Users.Include(u => u.ProductInventory).ToListAsync();
    }

    [HttpGet("{id}"), MapToApiVersion( 1.0 )]
    public async Task<ActionResult<User>> GetUser(string id)
    {
        var userId = HttpContext.User.Identity?.Name;
        if (userId != id)
        {
            throw new UnauthorizedAccessException($"You are not authorized to get user with ID {id}.");
        }

        var existingUser = await _context.Users.Include(u => u.ProductInventory).FirstOrDefaultAsync(u => u.Id == userId);
        if (existingUser == null)
        {
            throw new KeyNotFoundException($"User with ID {id} does not exist.");
        }

        return existingUser;
    }

    [HttpPatch, MapToApiVersion( 1.0 )]
    public async Task<ActionResult<User>> UpdateUser(User user)
    {
        var userId = HttpContext.User.Identity?.Name;
        if (userId != user.Id)
        {
            throw new UnauthorizedAccessException($"You are not authorized to update user with ID {user.Id}.");
        }

        var existingUser = await _context.Users.FirstOrDefaultAsync(u => u.Id == user.Id);
        if (existingUser == null)
        {
            throw new KeyNotFoundException($"User with ID {user.Id} does not exist.");
        }

        existingUser.DisplayName = user.DisplayName;
        await _context.SaveChangesAsync();

        return Ok(existingUser);
    }

    [HttpPost, MapToApiVersion( 1.0 )]
    public async Task<ActionResult<User>> CreateUser()
    {
        var userId = HttpContext.User.Identity?.Name;
        var displayName = HttpContext.User.Claims.First(c => c.Type == DisplayNameClaimType).Value;
        if (String.IsNullOrEmpty(userId))
        {
            throw new ArgumentException("Invalid User ID.");
        }

        var newUser = new User()
        {
            Id = userId,
            DisplayName = displayName,
            Balance = 0,
            LastLogonDateTime = DateTime.Now,
            RegisteredDateTime = DateTime.Now
        };

        _context.Users.Add(newUser);
        await _context.SaveChangesAsync();

        return CreatedAtAction(
            nameof(CreateUser),
            new {id = newUser.Id},
            newUser);
    }
}