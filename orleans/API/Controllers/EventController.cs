using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GrainInterfaces;
using Microsoft.AspNetCore.Mvc;
using Orleans;
using Microsoft.Extensions.Logging;
using GrainModels;


namespace API.Controllers
{

  // this is API that handles all calls to grains 
  [Route("api/[controller]")]
  public class EventsController : Controller
  {
    private IClusterClient client;
    private readonly ILogger logger;


    public EventsController(IClusterClient client, ILogger<EventsController> logger)
    {
      this.client = client;
      this.logger = logger;
    }


    // Create new event
    // POST /api/events
    [HttpPost("")]
    public async Task<EventAPI> Post([FromBody] EventAPI body)  
    {
      logger.LogInformation($"POST /api/events: incoming body = {body}");

      // create new event code, which we tend to keep short to be more memorable
      string eventCode = makeId(6);
      logger.LogInformation($"POST event code created = {eventCode}");

      // initialise grain with event info
      await ConnectClientIfNeeded();
      var grain = this.client.GetGrain<IEventGrain>(eventCode);
      await grain.Update(body.title, body.type, body.start, body.end, body.topics);

      // return body with event code added
      body.id = eventCode;
      return body;
    }


    // Get specific event info
    // GET api/events/{id}
    [HttpGet("{id}")]
    public async Task<EventAPI> Get(string id)
    {
      logger.LogInformation($"GET api/events/id: id = {id}");

      // call grain
      EventAPI info = new EventAPI();
      await ConnectClientIfNeeded();
      var grain = this.client.GetGrain<IEventGrain>(id);
      info = await grain.Info();

      return info;
    }





    // Simple random ID generator, good enough, with len=6 it's a 1:56 in billion chance of a clash
    private string makeId(int len)
    {
      var text = "";
      Random rand = new Random();
      var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

      for (var i = 0; i < len; i++)
        text += possible[rand.Next(0, possible.Length - 1)];

      return text;
    }


    // Orleans helper function 
    private async Task ConnectClientIfNeeded()
    {
      if (!this.client.IsInitialized)
      {
        await Task.Delay(TimeSpan.FromSeconds(5));
        await this.client.Connect();
      }
    }
  }
}
