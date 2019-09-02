using Grains;
using Microsoft.Extensions.Logging;
using Orleans;
using Orleans.Configuration;
using Orleans.Hosting;
using System;
using System.Net;
using System.Runtime.Loader;
using System.Threading;
using System.Threading.Tasks;
using Microsoft.Extensions.Configuration;
using System.Net.Sockets;

namespace Silo
{
  public class Program
  {
    private static ISiloHost silo;
    private static readonly ManualResetEvent siloStopped = new ManualResetEvent(false);

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
          .AddEnvironmentVariables();
      IConfigurationRoot appSettings = appSettingsBuilder.Build();

      // start the silo
      // see https://dotnet.github.io/orleans/Documentation/Deployment-and-Operations/Configuration-Guide/Typical-Configurations.html 
      silo = new SiloHostBuilder()
          .Configure<ProcessExitHandlingOptions>(options => {
              options.FastKillOnProcessExit = true;
          })
          .Configure<ClusterOptions>(options => {
              options.ClusterId = appSettings["Orleans:ClusterId"];
              options.ServiceId = appSettings["Orleans:ServiceId"];
          })
          // Setting SiloName is more reliable when running in Kubernetes, the hostname will be the podname
          // When run in a StatefulSet, we'll get stable pod and hostnames
          .Configure<SiloOptions>(options => {
              options.SiloName = System.Environment.MachineName;                            
          })
          .UseAzureStorageClustering(options => options.ConnectionString = appSettings["Orleans:ConnectionString"])
          .UseAzureTableReminderService(options => options.ConnectionString = appSettings["Orleans:ConnectionString"])
          .AddAzureTableGrainStorage("grain-store", options => {
              options.ConnectionString = appSettings["Orleans:ConnectionString"];
          })
          // last param is important it enables listening on all interfaces
          .ConfigureEndpoints(siloPort, gatewayPort, AddressFamily.InterNetwork, true)
          .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(EventGrain).Assembly).WithReferences())
          .ConfigureLogging(builder => builder.SetMinimumLevel((LogLevel)appSettings.GetValue<int>("Orleans:LogLevel")).AddConsole())
          .Build();

      Task.Run(StartSilo);

      AssemblyLoadContext.Default.Unloading += context =>
      {
        Task.Run(StopSilo);
        siloStopped.WaitOne();
      };

      siloStopped.WaitOne();
    }

    private static async Task StartSilo()
    {
      await silo.StartAsync();
      Console.WriteLine("##### Silo started!");
    }

    private static async Task StopSilo()
    {
      await silo.StopAsync();
      Console.WriteLine("##### Silo stoped!");
      siloStopped.Set();
    }
  }
}

/*
          .Configure<EndpointOptions>(options => {
            options.SiloPort = 11111;
            options.GatewayPort = 30000;
            if(appSettings["Orleans:AdvertisedIPAddress"] != null) {
              options.AdvertisedIPAddress = IPAddress.Parse(appSettings["Orleans:AdvertisedIPAddress"]);
            };
            
            //options.AdvertisedIPAddress = IPAddress.Parse("172.16.0.42");
          })
          
           */