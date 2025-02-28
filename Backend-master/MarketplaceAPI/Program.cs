using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.Identity.Web;
using MarketplaceAPI.Models;
using System.Text.Json.Serialization;
using MarketplaceAPI.Filters;
using Microsoft.Extensions.Logging.ApplicationInsights;
using System.Security.Claims;
using MarketplaceAPI.Middleware;

var builder = WebApplication.CreateBuilder(args);

// Add services to the container.
builder.Services.AddAuthentication(JwtBearerDefaults.AuthenticationScheme)
.AddMicrosoftIdentityWebApi(options =>
{
  builder.Configuration.Bind("AzureAdB2C", options);
  options.TokenValidationParameters.NameClaimType = ClaimTypes.NameIdentifier;
},
options => { builder.Configuration.Bind("AzureAdB2C", options); });

builder.Services.AddControllers(config =>
{
    config.Filters.Add<ExceptionFilter>();
})
.AddJsonOptions(options =>
{
    options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
    options.JsonSerializerOptions.Converters.Add(new JsonStringEnumConverter());
});

// Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
builder.Services.AddDbContext<MarketplaceContext>();
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen();
builder.Services.AddApiVersioning(
                    options =>
                    {
                        // reporting api versions will return the headers
                        // "api-supported-versions" and "api-deprecated-versions"
                        options.ReportApiVersions = true;
                    } )
                .AddMvc();

builder.Services.AddApplicationInsightsTelemetry();

builder.Logging.AddApplicationInsights();

builder.Logging.AddFilter<ApplicationInsightsLoggerProvider>("", LogLevel.Warning);
builder.Logging.AddFilter<ApplicationInsightsLoggerProvider>("MarketplaceAPI.Controllers", LogLevel.Information);

var app = builder.Build();

app.UseMiddleware<CorsMiddleware>();

// Configure the HTTP request pipeline.
app.UseSwagger();
app.UseSwaggerUI();

app.UseHttpsRedirection();

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();

public partial class Program { }