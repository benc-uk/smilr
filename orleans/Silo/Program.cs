using Orleans;
using Orleans.Configuration;
using Orleans.Hosting;
using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Grains;
using System.Threading.Tasks;

namespace Silo
{
  public class Program
  {
    public static async Task Main(string[] args)
    {
      Console.WriteLine("##### Starting Silo...");
      var siloPort = 11111;
      var gatewayPort = 30000;

      // get the config data needed for Orleans silo. We tend to favour Azure table storage, and include a sample appsettings.Sample.json file.
      // for more info on configuration in ASP.NET Core see https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?tabs=basicconfiguration 
      var appSettingsBuilder = new ConfigurationBuilder()
        .SetBasePath(System.IO.Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
        .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
        .AddEnvironmentVariables();

      IConfigurationRoot appSettings = appSettingsBuilder.Build();

      Console.WriteLine($"##### Using ClusterId={appSettings["Orleans:ClusterId"]}, ServiceId={appSettings["Orleans:ServiceId"]}, siloPort={siloPort}, gatewayPort={gatewayPort}");

      var host = Host.CreateDefaultBuilder(args);

      host.UseOrleans(builder => {
        builder
        // Set the ClusterId and ServiceId
        .Configure<ClusterOptions>(opts => {
          opts.ClusterId = appSettings["Orleans:ClusterId"];
          opts.ServiceId = appSettings["Orleans:ServiceId"];
        })
        
        // Specify default ports and listen on ALL addresses 
        .ConfigureEndpoints(siloPort, gatewayPort, listenOnAnyHostAddress: true)
        // And logging
        .ConfigureLogging(builder => builder.SetMinimumLevel((LogLevel)appSettings.GetValue<int>("Orleans:LogLevel")).AddConsole())
        // Recommended way to load assemblies 
        .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(EventGrain).Assembly).WithReferences())

        // Set up clustering and state storage
        .UseAzureStorageClustering(options => options.ConnectionString = appSettings["Orleans:ConnectionString"])
        .UseAzureTableReminderService(options => options.ConnectionString = appSettings["Orleans:ConnectionString"])
        .AddAzureTableGrainStorage("grain-store", options => {
          options.UseJson = true;
          options.ConnectionString = appSettings["Orleans:ConnectionString"];
        });
      });

      await host.RunConsoleAsync();
    }
  }
}
