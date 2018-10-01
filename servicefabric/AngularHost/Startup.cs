using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Builder;
using Microsoft.AspNetCore.Hosting;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Routing;
using Microsoft.Extensions.DependencyInjection;
using Newtonsoft.Json;

namespace AngularHost
{
  public class Startup
  {
    private readonly ConfigSettings configSettings;

    public Startup(ConfigSettings configSettings)
    {
      this.configSettings = configSettings;
    }
    // This method gets called by the runtime. Use this method to add services to the container.
    // For more information on how to configure your application, visit https://go.microsoft.com/fwlink/?LinkID=398940
    public void ConfigureServices(IServiceCollection services)
    {
    }

    // This method gets called by the runtime. Use this method to configure the HTTP request pipeline.
    public void Configure(IApplicationBuilder app, IHostingEnvironment env)
    {
      if (env.IsDevelopment())
      {
        app.UseDeveloperExceptionPage();
      }

      var trackPackageRouteHandler = new RouteHandler(context =>
      {
        var routeValues = context.GetRouteData().Values;
        return context.Response.WriteAsync(
            $"Hello! Route values: {string.Join(", ", routeValues)}");
      });

      var routeBuilder = new RouteBuilder(app, trackPackageRouteHandler);

      routeBuilder.MapGet(".config/{configKeys}", context =>
      {
        var configKeys = context.GetRouteValue("configKeys");
        // This is the route handler when HTTP GET ".config/<anything>"  matches
        // To match HTTP GET "hello/<anything>/<anything>,
        // use routeBuilder.MapGet("hello/{*name}"

        return context.Response.WriteAsync(
          JsonConvert.SerializeObject(
               new
               {
                 API_ENDPOINT = this.configSettings.API_ENDPOINT
               }));
      });

      //routeBuilder.MapGet(".auth/", context =>
      //{
      //  return;
      //});

      var routes = routeBuilder.Build();
      app.UseRouter(routes);

      app.UseFileServer();
    }
  }
}
