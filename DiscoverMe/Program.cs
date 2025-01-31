using DotNetEnv;  // Add this to access the .env file

var builder = WebApplication.CreateBuilder(args);
Console.WriteLine("🚀 Application is starting...");

// Load environment variables from .env file
Env.Load();

var app = builder.Build();

// Use static files and routing
app.UseStaticFiles();
app.UseRouting();

// ✅ Fix: Add missing API route to fetch API key
app.MapGet("/api/google-maps-key", () =>
{
    // Retrieve the API key from the environment variable
    var apiKey = Environment.GetEnvironmentVariable("GOOGLE_MAPS_API_KEY");

    if (string.IsNullOrEmpty(apiKey))
    {
        Console.WriteLine("❌ Google Maps API Key is missing!");
        return Results.Json(new { error = "API key not set" }, statusCode: 500);
    }

    return Results.Json(new { apiKey });
});

// ✅ Ensure index.html is served correctly
app.MapGet("/", (HttpContext context) =>
{
    Console.WriteLine("🔄 Redirecting to index.html...");
    context.Response.Redirect("/index.html");
    return Task.CompletedTask;
});

Console.WriteLine("✅ Middleware configured. Application should be running...");
app.Run();














