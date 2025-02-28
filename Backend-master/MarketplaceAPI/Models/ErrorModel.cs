namespace MarketplaceAPI.Models;
public class ErrorModel
{
    public int ErrorCode { get; set; }
    public string? Message { get; set; }
    public string? Details { get; set; } 

    public ErrorModel(int errorCode, string? message, string? details = null)
    {
        ErrorCode = errorCode;
        Message = message;
        Details = details;
    }
}