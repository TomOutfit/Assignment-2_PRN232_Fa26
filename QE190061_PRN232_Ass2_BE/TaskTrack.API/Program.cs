using System.Text;
using System.Text.Json.Serialization;
using Microsoft.AspNetCore.Authentication.JwtBearer;
using Microsoft.EntityFrameworkCore;
using Microsoft.IdentityModel.Tokens;
using Microsoft.OpenApi.Models;
using Npgsql;
using TaskTrack.Repo.Models;
using TaskTrack.Repo.Repositories;
using TaskTrack.Service.Services;

// Enable Npgsql legacy timestamp behavior for compatibility with 'timestamp without time zone'
AppContext.SetSwitch("Npgsql.EnableLegacyTimestampBehavior", true);

var builder = WebApplication.CreateBuilder(args);

// Load .env file if present
var possibleEnvPaths = new[]
{
    Path.Combine(Directory.GetCurrentDirectory(), ".env"),
    Path.Combine(Directory.GetCurrentDirectory(), "..", ".env"),
    Path.Combine(AppContext.BaseDirectory, ".env"),
    Path.Combine(builder.Environment.ContentRootPath, ".env"),
    Path.Combine(builder.Environment.ContentRootPath, "..", ".env")
};

foreach (var envPath in possibleEnvPaths)
{
    if (File.Exists(envPath))
    {
        foreach (var line in File.ReadAllLines(envPath))
        {
            var parts = line.Split('=', 2);
            if (parts.Length == 2 && !string.IsNullOrWhiteSpace(parts[0]) && !parts[0].StartsWith("#"))
            {
                var key = parts[0].Trim();
                var val = parts[1].Trim();
                Environment.SetEnvironmentVariable(key, val);
            }
        }
        break;
    }
}

// 1. Configure PostgreSQL Connection String (supports Render DATABASE_URL or individual env vars)
string? connectionString = Environment.GetEnvironmentVariable("DATABASE_URL");

if (!string.IsNullOrEmpty(connectionString) && (connectionString.StartsWith("postgres://") || connectionString.StartsWith("postgresql://")))
{
    var uri = new Uri(connectionString);
    var userInfo = uri.UserInfo.Split(':');
    var npgsqlBuilder = new NpgsqlConnectionStringBuilder
    {
        Host = uri.Host,
        Port = uri.Port > 0 ? uri.Port : 5432,
        Username = userInfo.Length > 0 ? userInfo[0] : "",
        Password = userInfo.Length > 1 ? userInfo[1] : "",
        Database = uri.AbsolutePath.TrimStart('/'),
        SslMode = SslMode.Require
    };
    connectionString = npgsqlBuilder.ToString();
}
else
{
    var host = Environment.GetEnvironmentVariable("DATABASE_HOST");
    if (!string.IsNullOrEmpty(host))
    {
        var npgsqlBuilder = new NpgsqlConnectionStringBuilder
        {
            Host = host,
            Port = int.TryParse(Environment.GetEnvironmentVariable("DATABASE_PORT"), out var port) ? port : 5432,
            Username = Environment.GetEnvironmentVariable("DATABASE_USERNAME") ?? "",
            Password = Environment.GetEnvironmentVariable("DATABASE_PASSWORD") ?? "",
            Database = Environment.GetEnvironmentVariable("DATABASE_NAME") ?? "postgres",
            SslMode = SslMode.Require
        };
        connectionString = npgsqlBuilder.ToString();
    }
    else
    {
        connectionString = builder.Configuration.GetConnectionString("DefaultConnection");
        if (!string.IsNullOrEmpty(connectionString) && connectionString.Contains("${"))
        {
            connectionString = connectionString
                .Replace("${DATABASE_HOST}", Environment.GetEnvironmentVariable("DATABASE_HOST") ?? "aws-0-ap-southeast-1.pooler.supabase.com")
                .Replace("${DATABASE_PORT}", Environment.GetEnvironmentVariable("DATABASE_PORT") ?? "5432")
                .Replace("${DATABASE_NAME}", Environment.GetEnvironmentVariable("DATABASE_NAME") ?? "postgres")
                .Replace("${DATABASE_USERNAME}", Environment.GetEnvironmentVariable("DATABASE_USERNAME") ?? "postgres.shykrynmlragkzeebydx")
                .Replace("${DATABASE_PASSWORD}", Environment.GetEnvironmentVariable("DATABASE_PASSWORD") ?? "8cHKGQGyYdzkBGNa");
        }
    }
}

builder.Services.AddDbContext<TaskTrackDbContext>(options =>
{
    options.UseNpgsql(connectionString);
});

// 2. Register Repositories
builder.Services.AddScoped<IDepartmentRepository, DepartmentRepository>();
builder.Services.AddScoped<IProjectRepository, ProjectRepository>();
builder.Services.AddScoped<ITaskRepository, TaskRepository>();
builder.Services.AddScoped<ITagRepository, TagRepository>();
builder.Services.AddScoped<IAccountRepository, AccountRepository>();

// 3. Register Services
builder.Services.AddScoped<IDepartmentService, DepartmentService>();
builder.Services.AddScoped<IProjectService, ProjectService>();
builder.Services.AddScoped<ITaskService, TaskService>();
builder.Services.AddScoped<ITagService, TagService>();
builder.Services.AddScoped<IJwtTokenGenerator, JwtTokenGenerator>();
builder.Services.AddScoped<IAuthService, AuthService>();
builder.Services.AddScoped<IAccountService, AccountService>();

// 4. Configure JWT Authentication
var jwtSecret = Environment.GetEnvironmentVariable("JWT_SECRET")
                ?? builder.Configuration["JwtSettings:SecretKey"]
                ?? "Default_Super_Secure_Secret_Key_For_PRN232_TaskTrack_Assignment_2_Must_Be_Long!";
var jwtIssuer = Environment.GetEnvironmentVariable("JWT_ISSUER")
                ?? builder.Configuration["JwtSettings:Issuer"]
                ?? "TaskTrackAPI";
var jwtAudience = Environment.GetEnvironmentVariable("JWT_AUDIENCE")
                  ?? builder.Configuration["JwtSettings:Audience"]
                  ?? "TaskTrackClient";

builder.Services.AddAuthentication(options =>
{
    options.DefaultAuthenticateScheme = JwtBearerDefaults.AuthenticationScheme;
    options.DefaultChallengeScheme = JwtBearerDefaults.AuthenticationScheme;
})
.AddJwtBearer(options =>
{
    options.RequireHttpsMetadata = false;
    options.SaveToken = true;
    options.TokenValidationParameters = new TokenValidationParameters
    {
        ValidateIssuerSigningKey = true,
        IssuerSigningKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(jwtSecret)),
        ValidateIssuer = true,
        ValidIssuer = jwtIssuer,
        ValidateAudience = true,
        ValidAudience = jwtAudience,
        ValidateLifetime = true,
        ClockSkew = TimeSpan.Zero
    };
});

builder.Services.AddAuthorization();

// 5. Configure CORS
builder.Services.AddCors(options =>
{
    options.AddPolicy("AllowAll", policy =>
    {
        policy.AllowAnyOrigin()
              .AllowAnyHeader()
              .AllowAnyMethod();
    });
});

// 6. Configure Controllers & JSON Options
builder.Services.AddControllers()
    .AddJsonOptions(options =>
    {
        options.JsonSerializerOptions.ReferenceHandler = ReferenceHandler.IgnoreCycles;
        options.JsonSerializerOptions.DefaultIgnoreCondition = JsonIgnoreCondition.WhenWritingNull;
        options.JsonSerializerOptions.PropertyNamingPolicy = System.Text.Json.JsonNamingPolicy.CamelCase;
    });

// 7. Configure Swagger/OpenAPI with JWT Bearer Authentication UI
builder.Services.AddEndpointsApiExplorer();
builder.Services.AddSwaggerGen(c =>
{
    c.SwaggerDoc("v1", new OpenApiInfo
    {
        Title = "TaskTrack API - PRN232 Assignment 2",
        Version = "v2",
        Description = "Task & Team Management Web API with User Authentication and Role-based Access Control (ASP.NET Core & PostgreSQL)"
    });

    // Add JWT Bearer Security Definition
    var securityScheme = new OpenApiSecurityScheme
    {
        Name = "Authorization",
        Description = "Enter JWT Bearer token format: Bearer {token}",
        In = ParameterLocation.Header,
        Type = SecuritySchemeType.Http,
        Scheme = "bearer",
        BearerFormat = "JWT",
        Reference = new OpenApiReference
        {
            Id = JwtBearerDefaults.AuthenticationScheme,
            Type = ReferenceType.SecurityScheme
        }
    };

    c.AddSecurityDefinition(securityScheme.Reference.Id, securityScheme);
    c.AddSecurityRequirement(new OpenApiSecurityRequirement
    {
        { securityScheme, Array.Empty<string>() }
    });
});

var app = builder.Build();

// 8. Configure HTTP Request Pipeline
app.UseSwagger();
app.UseSwaggerUI(c =>
{
    c.SwaggerEndpoint("/swagger/v1/swagger.json", "TaskTrack API v2");
    c.RoutePrefix = "swagger";
});

// Redirect root / to /swagger for easy access
app.MapGet("/", () => Results.Redirect("/swagger"));

app.UseCors("AllowAll");

app.UseAuthentication();
app.UseAuthorization();

app.MapControllers();

app.Run();
