
using CASE_STUDY_7.DataAccess;
using CASE_STUDY_7.Hubs;
using CASE_STUDY_7.Services;
using CASE_STUDY_7_DataAccess;
using CASE_STUDY_7_DataAccess.Repositories;
using CASE_STUDY_7_Models.Interfaces;
using CASE_STUDY_Core.Cache;
using CASE_STUDY_Core.Engine;
using CASE_STUDY_Core.Services;

using Microsoft.EntityFrameworkCore;
using Serilog;

namespace CASE_STUDY_7
{
    public class Program
    {
        public static void Main(string[] args)
        {
            var builder = WebApplication.CreateBuilder(args);

            var connectionString = builder.Configuration.GetConnectionString("MyCon");

            builder.Host.UseSerilog((context, services, configuration) => configuration
                            .ReadFrom.Configuration(context.Configuration)
                            .ReadFrom.Services(services));


            // Add services to the container.

            builder.Services.AddControllers();

            // Learn more about configuring Swagger/OpenAPI at https://aka.ms/aspnetcore/swashbuckle
            builder.Services.AddEndpointsApiExplorer();
            builder.Services.AddSwaggerGen();
            builder.Services.AddSignalR();
            builder.Services.AddHostedService<MarketDataSimulationService>();

            builder.Services.AddDbContext<Vantage7Context>(options =>
                options.UseSqlServer(connectionString));
            builder.Services.AddCors(options => options.AddPolicy("MytestCors", policy => policy.WithOrigins("http://localhost:5173").AllowAnyHeader().WithMethods("GET").AllowCredentials()));

            builder.Services.AddTransient<ITradeRepository, TradeRepository>();
            builder.Services.AddTransient<IPriceRepository, PriceRepository>();
            builder.Services.AddTransient<IPnlCalculatorEngine, PnlCalculatorEngine>();
            builder.Services.AddTransient<IPnlCalculationService, PnlCalculationService>();
            builder.Services.AddTransient<ITradeBlotterRepository, TradeBlotterRepository>();
            builder.Services.AddTransient<ITraderRepository, TraderRepository>();
            builder.Services.AddTransient<ISecurityRepository,SecurityRepository>();

            // 2. In-Memory State Cache (Singleton)[cite: 1]
            builder.Services.AddSingleton<IPnlStateCache, PnlStateCache>();

            var app = builder.Build();

            // Configure the HTTP request pipeline.
            if (app.Environment.IsDevelopment())
            {
                app.UseSwagger();
                app.UseSwaggerUI();
            }

            app.UseSerilogRequestLogging();
            app.UseHttpsRedirection();

            app.UseAuthorization();
            app.UseCors("MytestCors");

            app.MapControllers();
            app.MapHub<PnLHub>("/hubs/pnl");

            app.Run();
        }
    }
}
