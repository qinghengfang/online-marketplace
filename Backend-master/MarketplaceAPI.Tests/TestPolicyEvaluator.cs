using System.Security.Claims;
using MarketplaceAPI.Controllers;
using Microsoft.AspNetCore.Authentication;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Authorization.Policy;
using Microsoft.AspNetCore.Http;

namespace MarketplaceAPI.Tests;

public class TestPolicyEvaluator : IPolicyEvaluator
{
    public const string TestDisplayName = "test display name";
    public const string TestId = "test Id";

    public virtual async Task<AuthenticateResult> AuthenticateAsync(AuthorizationPolicy policy, HttpContext context)
    {
        var principal = new ClaimsPrincipal();

        principal.AddIdentity(new ClaimsIdentity(new[]
        {
            new Claim(UsersController.DisplayNameClaimType, TestDisplayName),
            new Claim(ClaimTypes.NameIdentifier, TestId)
        }, "TestScheme", ClaimTypes.NameIdentifier, ClaimTypes.Role));

        return await Task.FromResult(AuthenticateResult.Success(new AuthenticationTicket(principal,
         new AuthenticationProperties(), "TestScheme")));
    }

    public virtual async Task<PolicyAuthorizationResult> AuthorizeAsync(AuthorizationPolicy policy,
     AuthenticateResult authenticationResult, HttpContext context, object? resource)
    {
        return await Task.FromResult(PolicyAuthorizationResult.Success());
    }
}