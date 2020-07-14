using System;
using GrainInterfaces;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.Extensions.Configuration;
using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Logging;
using Microsoft.Extensions.Hosting;
using Orleans;
using Orleans.Hosting;
using Orleans.Configuration;

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
        public void Configure(IApplicationBuilder app, IWebHostEnvironment env)
        {
            if (env.IsDevelopment())
            {
                app.UseDeveloperExceptionPage();
            }

            //app.UseHttpsRedirection();
            app.UseRouting();
            app.UseEndpoints(routes =>
            {
                routes.MapControllers();
            });
        }

        private IClusterClient CreateClusterClient(IServiceProvider serviceProvider)
        {
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

            var client = builder.Build();
            client.Connect().Wait();

            return client;
        }
    }
}
