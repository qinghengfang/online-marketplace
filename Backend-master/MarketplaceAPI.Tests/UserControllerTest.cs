using System.Security.Claims;
using MarketplaceAPI.Controllers;
using MarketplaceAPI.Models;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.EntityFrameworkCore;
using Microsoft.Extensions.Logging;
using Moq;

namespace MarketplaceAPI.Tests;

[TestClass]
public class UserControllerTest
{
    [TestMethod]
    public async Task TestCreateUser()
    {
        IList<User> userCollection = new List<User>();
        var mockWebHosting = new Mock<IWebHostEnvironment>();
        var mockDbContext = new Mock<MarketplaceContext>(mockWebHosting.Object);
        mockDbContext.Setup(mock => mock.SaveChangesAsync(It.IsAny<CancellationToken>()));
        mockDbContext.Setup(mock => mock.Users.Add(It.IsAny<User>())).Callback(userCollection.Add);
        var mockLogger = new Mock<ILogger<UsersController>>();

        User testUser = new() {
            Id = "1",
            DisplayName = "test name"
        };
        
        UsersController controller = new UsersController(mockLogger.Object, mockDbContext.Object);
        var mockHttpContext = new Mock<HttpContext>();
        mockHttpContext.SetupGet(mock => mock.User.Identity.Name).Returns("1");
        mockHttpContext.SetupGet(mock => mock.User.Claims).Returns([new Claim(UsersController.DisplayNameClaimType, "test name")]);
        controller.ControllerContext.HttpContext = mockHttpContext.Object;

        ActionResult<User> actionResult = await controller.CreateUser();
        Assert.IsNotNull(actionResult.Result, "return result is not null");
        CreatedAtActionResult createdAtActionResult = (CreatedAtActionResult)actionResult.Result;
        User createdUser = userCollection.First();

        mockDbContext.Verify(mock => mock.SaveChangesAsync(It.IsAny<CancellationToken>()), Times.Once());
        Assert.AreEqual(1, userCollection.Count, "Verify User Database should have only 1 user.");
        Assert.AreEqual(testUser, createdUser, "Verify created user in db should be the same as the received one in controller.");
        Assert.AreEqual("CreateUser", createdAtActionResult.ActionName, "Verify return action name.");
        Assert.AreEqual(testUser, createdAtActionResult.Value, "Verify return user is the same as created one.");
    }
}