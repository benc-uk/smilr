using System;
using System.Collections.Generic;
using System.IO;
using System.Linq;
using System.Threading.Tasks;
using GrainInterfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Options;
using Orleans;
using Orleans.Hosting;
using Orleans.Configuration;
using System.Net;

namespace API
{
    public class Startup
    {
        public Startup(IConfiguration configuration)
        {
            Configuration = configuration;
        }

        public IConfiguration Configuration { get; }

        // This method gets called by the runtime. Use this method to add services to the container.
        public void ConfigureServices(IServiceCollection services)
        {
            services.AddMvc();
            services.AddSingleton<IClusterClient>(CreateClusterClient);
        }

        // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
        public void Configure(IApplicationBuilder app, Microsoft.AspNetCore.Hosting.IHostingEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            app.UseMvc();
        }

        private IClusterClient CreateClusterClient(IServiceProvider serviceProvider)
        {
            var gatewayPort = 30000;

            Console.WriteLine("##### Starting Orleans client!");
            Console.WriteLine($"##### Using ClusterId = {this.Configuration["Orleans:ClusterId"]}, ServiceId = {this.Configuration["Orleans:ServiceId"]}");

            var builder = new ClientBuilder()
                .ConfigureApplicationParts(parts => parts.AddApplicationPart(typeof(IEventGrain).Assembly))
                .Configure<ClusterOptions>(options => {
                    options.ClusterId = this.Configuration["Orleans:ClusterId"];
                    options.ServiceId = this.Configuration["Orleans:ServiceId"];
                })
                .UseAzureStorageClustering(options => options.ConnectionString = this.Configuration["Orleans:ConnectionString"])
                .ConfigureLogging(options => options.SetMinimumLevel((LogLevel)this.Configuration.GetValue<int>("Orleans:LogLevel")).AddConsole());

            if(this.Configuration["Orleans:SiloHost"] != null) {
                Console.WriteLine($"##### SiloHost = {this.Configuration["Orleans:SiloHost"]}");
                Console.WriteLine($"##### Configuring static clustering");
                
                // DNS entry could have multiple IP addresses, built an IPEndPoint array of them all
                IPHostEntry dnsHostEntry = Dns.GetHostEntry(this.Configuration["Orleans:SiloHost"]);
                IPEndPoint[] endpoints = new IPEndPoint[dnsHostEntry.AddressList.Length];
                for(int ipIndex = 0; ipIndex < dnsHostEntry.AddressList.Length; ipIndex++) {
                    IPAddress ip = dnsHostEntry.AddressList[ipIndex];
                    Console.WriteLine($"##### Resolved '{this.Configuration["Orleans:SiloHost"]}' to IP: {ip}");
                    endpoints[ipIndex] = new IPEndPoint(ip, gatewayPort);
                }
                builder.UseStaticClustering(endpoints);
                //builder.UseDnsNameLookupClustering(Configuration["Orleans:SiloHost"], gatewayPort);
            }

            var client = builder.Build();
            client.Connect().Wait();

            return client;
        }
    }
}
