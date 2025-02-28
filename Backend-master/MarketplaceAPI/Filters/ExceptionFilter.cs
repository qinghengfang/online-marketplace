using MarketplaceAPI.Models;
using Microsoft.AspNetCore.Mvc;
using Microsoft.AspNetCore.Mvc.Filters;
using Microsoft.AspNetCore.Mvc.Formatters;

namespace MarketplaceAPI.Filters;

public class ExceptionFilter : IExceptionFilter
{
    private readonly IHostEnvironment _hostEnvironment;

    public ExceptionFilter(IHostEnvironment hostEnvironment) =>
        _hostEnvironment = hostEnvironment;

    public void OnException(ExceptionContext context)
    {
        int errorCode = 0;
        int statusCode = 0;
        switch(context.Exception)
        {
            case ArgumentException:
                errorCode = 101;
                statusCode = 400;
                break;
            case UnauthorizedAccessException:
                errorCode = 102;
                statusCode = 401;
                break;
            case KeyNotFoundException:
                errorCode = 103;
                statusCode = 404;
                break;
            default:
                break;
        }

        var error = new ErrorModel
        (
            errorCode,
            context.Exception.Message,
            _hostEnvironment.IsDevelopment() ? context.Exception.StackTrace : null
        );

        context.Result = new ObjectResult(error) { StatusCode = statusCode };
    }
}