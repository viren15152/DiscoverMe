using DotNetEnv;  // ✅ Ensure DotNetEnv package is installed
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using System;

var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("🚀 Application is starting...");

// ✅ Load environment variables from .env file (with error handling)
try
{
    Env.Load();
    Console.WriteLine("✅ .env file loaded successfully.");
}
catch (Exception ex)
{
    Console.WriteLine($"❌ Error loading .env file: {ex.Message}");
}

var app = builder.Build();

// ✅ Serve static files (needed for index.html & JS)
app.UseStaticFiles();
app.UseRouting();

// ✅ API route to fetch the Google Maps API key
app.MapGet("/api/google-maps-key", () =>
{
    // Retrieve the API key from environment variables
    var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");

    if (string.IsNullOrEmpty(apiKey))
    {
        Console.WriteLine("❌ Google Maps API Key is missing!");
        return Results.Json(new { error = "API key not set" }, statusCode: 500);
    }

    Console.WriteLine("🔑 Google Maps API Key successfully retrieved.");
    return Results.Json(new { apiKey });
});

// ✅ Ensure `index.html` serves correctly
app.MapFallbackToFile("index.html");

// ✅ Run the application
Console.WriteLine("✅ Application middleware configured. Running...");
app.Run();















