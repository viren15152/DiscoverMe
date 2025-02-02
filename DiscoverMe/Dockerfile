# Use the official .NET 9 SDK image for building the app
FROM mcr.microsoft.com/dotnet/sdk:9.0 AS build
WORKDIR /app

# Copy everything and restore dependencies
COPY . ./
RUN dotnet restore
RUN dotnet publish -c Release -o out

# Use the official .NET 9 runtime image to run the app
FROM mcr.microsoft.com/dotnet/aspnet:9.0 AS runtime
WORKDIR /app

# Copy the published app from the build stage
COPY --from=build /app/out ./

# Expose the required port (Render expects 8080)
EXPOSE 8080

# Set the entry point for the container
ENTRYPOINT ["dotnet", "DiscoverMe.dll"]
