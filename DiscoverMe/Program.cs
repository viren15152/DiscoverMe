using DotNetEnv;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Http;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.FileProviders;
using System;
using System.IO;

var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("🚀 Application is starting...");

// ✅ Load environment variables (ensure .env exists)
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

// Enable Routing Middleware (MUST be before defining routes)
app.UseRouting();

// Serve static files from `wwwroot`
app.UseStaticFiles(new StaticFileOptions
{
    FileProvider = new PhysicalFileProvider(Path.Combine(Directory.GetCurrentDirectory(), "wwwroot")),
    RequestPath = ""
});

// API Route: Fetch Google Maps API Key
app.MapGet("/api/google-maps-key", () =>
{
    var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");

    if (string.IsNullOrEmpty(apiKey))
    {
        Console.WriteLine("❌ Google Maps API Key is missing!");
        return Results.Json(new { error = "API key not set" }, statusCode: 500);
    }

    Console.WriteLine($"🔑 API Key Retrieved: {apiKey.Substring(0, 5)}*****");
    return Results.Json(new { apiKey });
});

// Catch-All Route: Ensures Frontend Routing Works (SPA Support)
app.MapFallbackToFile("/index.html");

// Run the application
Console.WriteLine("✅ Application is running...");
app.Run();
Env.Load();
Console.WriteLine($"Google Maps API Key Loaded: {Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY")}");















