using System.Net;
using System.Net.Http.Json;
using System.Text.Json;
using MarketplaceAPI.Models;
using Microsoft.Extensions.DependencyInjection;

namespace MarketplaceAPI.Tests;

[TestClass]
public class UserControllerIntegrationTest
{
    private static TestWebApplicationFactory<Program> factory = new TestWebApplicationFactory<Program>();
    private static HttpClient httpClient = factory.CreateClient();

    [ClassCleanup()]
    public static void ClassCleanup()
    {
        httpClient.Dispose();
        factory.Dispose();
    }

    [TestInitialize()]
    public async Task Initialize()
    {
        var scopeFactory = factory.Services.GetService<IServiceScopeFactory>();
        using (var scope = scopeFactory.CreateScope())
        {
            var dbContext = scope.ServiceProvider.GetService<MarketplaceContext>();
            if (dbContext != null && dbContext.Users.Any())
            {
                dbContext.Users.RemoveRange(dbContext.Users);
                await dbContext.SaveChangesAsync();
            }
        }
    }

    [TestMethod]
    public async Task IntegrationTestCreateUser()
    {
        var response = await httpClient.PostAsync("/api/v1/users", null);
        Assert.AreEqual(HttpStatusCode.Created, response.StatusCode);
        User? createdUser = await response.Content.ReadFromJsonAsync<User>();
        Assert.IsNotNull(createdUser);
        Assert.AreEqual(TestPolicyEvaluator.TestDisplayName, createdUser.DisplayName);
        Assert.AreEqual(TestPolicyEvaluator.TestId, createdUser.Id);
        Assert.AreEqual(0, createdUser.Balance);
    }
}