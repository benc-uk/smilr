using Orleans;
using Orleans.Configuration;
using Orleans.Hosting;
using System;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.Hosting;
using Microsoft.Extensions.Logging;
using Grains;

namespace Silo
{
  public class Program
  {
    static void Main(string[] args)
    {
      Console.WriteLine("##### Starting Silo...");
      var siloPort = 11111;
      var gatewayPort = 30000;

      // get the config data needed for Orleans silo. We tend tend to favour Azure table storage, and include a sample appsettings.Sample.json file.
      // for more info on configuration in ASP.NET Core see https://docs.microsoft.com/en-us/aspnet/core/fundamentals/configuration/?tabs=basicconfiguration 
      var appSettingsBuilder = new ConfigurationBuilder()
        .SetBasePath(System.IO.Directory.GetCurrentDirectory())
        .AddJsonFile("appsettings.json", optional: true, reloadOnChange: true)
        .AddJsonFile("appsettings.Development.json", optional: true, reloadOnChange: true)
        .AddEnvironmentVariables();

      IConfigurationRoot appSettings = appSettingsBuilder.Build();

      Console.WriteLine($"##### ClusterId={appSettings["Orleans:ClusterId"]}, ServiceId={appSettings["Orleans:ServiceId"]}, siloPort={siloPort}, gatewayPort={gatewayPort}");

      Host.CreateDefaultBuilder(args)
        .UseOrleans(siloBuilder =>
        {
          siloBuilder
          .Configure<ClusterOptions>(opts => {
            opts.ClusterId = appSettings["Orleans:ClusterId"];
            opts.ServiceId = appSettings["Orleans:ServiceId"];
          })
          // Setting SiloName is more reliable when running in Kubernetes, the hostname will be the podname
          // When run in a StatefulSet, we'll get stable pod and hostnames
          .Configure<SiloOptions>(options => {
            options.SiloName = System.Environment.MachineName;
          })
          
          // Full controll over ports, and network interface
          .ConfigureEndpoints(siloPort, gatewayPort, System.Net.Sockets.AddressFamily.InterNetwork, true)
          // And logging
          .ConfigureLogging(builder => builder.SetMinimumLevel((LogLevel)appSettings.GetValue<int>("Orleans:LogLevel")).AddConsole())
          // No idea what this does or if it's important
          .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(EventGrain).Assembly).WithReferences())

          // Set up clustering and state storage
          .UseAzureStorageClustering(options => options.ConnectionString = appSettings["Orleans:ConnectionString"])
          .UseAzureTableReminderService(options => options.ConnectionString = appSettings["Orleans:ConnectionString"])
          .AddAzureTableGrainStorage("grain-store", options => {
            options.UseJson = true;
            options.ConnectionString = appSettings["Orleans:ConnectionString"];
          });
        })
      .RunConsoleAsync();
    }
  }
}
