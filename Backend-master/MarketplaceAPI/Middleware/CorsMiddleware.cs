using System.Net;
using Microsoft.AspNetCore.Mvc;

namespace MarketplaceAPI.Middleware;

public class CorsMiddleware
{
    private readonly RequestDelegate _next;

    public CorsMiddleware(RequestDelegate next)
    {
        _next = next;
    }

    public async Task Invoke(HttpContext context)
    {
        context.Response.Headers["Access-Control-Allow-Origin"] = "*";
        context.Response.Headers["Access-Control-Allow-Headers"] = context.Request.Headers["Access-Control-Request-Headers"];
        context.Response.Headers["Access-Control-Allow-Methods"] = context.Request.Headers["Access-Control-Request-Method"];
        context.Response.Headers["Access-Control-Allow-Credentials"] = "true";

        if (context.Request.Method == "OPTIONS")
        {
            context.Response.StatusCode = 200;
            await context.Response.WriteAsync("OK");
            return;
        }
        
        await _next(context);
    }
}