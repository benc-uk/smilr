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
    [Produces("application/json")]
    [Route("api/events")]
    public class EventsController : Controller
    {
        private IClusterClient client;
        private readonly ILogger logger;

        public EventsController(IClusterClient client, ILogger<EventsController> logger)
        {
            this.client = client;
            this.logger = logger;
        }

        // POST /api/events - Create new event 
        [HttpPost("")]
        public async Task<EventApiData> Post([FromBody] EventApiData body)  
        {
            // create new event code, which we tend to keep short to be more memorable
            string eventCode = makeId(6);
            logger.LogInformation($"POST /api/events: Create new event, incoming body title = {body.title}, assigned to event code {eventCode}");

            // initialise grain with event info
            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IEventGrain>(eventCode);
            await grain.Update(body.title, body.type, body.start, body.end, body.topics);

            // return body with event code added
            body._id = eventCode;
            return body;
        }


      // PUT /api/events/{eventCode} - Update an existing event
      [HttpPut("{eventCode}")]
      public async Task<EventApiData> Put([FromBody] EventApiData body, string eventCode)
      {
          logger.LogInformation($"PUT /api/events: Update existing event, event code = {eventCode}, body title = {body.title}");

          //string eventCode = body._id;
          if (eventCode == "")
          {
              Response.StatusCode = 204;
              return body;
          }

          // update internal grain state

          await ConnectClientIfNeeded();
          var grain = this.client.GetGrain<IEventGrain>(eventCode);
          await grain.Update(body.title, body.type, body.start, body.end, body.topics);

          body._id = eventCode;  // make sure we include the event code back into the body
          
          return body;
      }

 

      // GET /api/events/{id} - Get specific event info
      [HttpGet("{id}")]
      public async Task<EventApiData> GetEvent(string id)
      {
          logger.LogInformation($"GET api/events/id: event id = {id}");

          // call event grain

          EventApiData info = new EventApiData();
          await ConnectClientIfNeeded();
          var grain = this.client.GetGrain<IEventGrain>(id);
          info = await grain.Info();

          return info;
      }

    
      // GET /api/events - return a list of all events
      [HttpGet("")]
      public async Task<EventApiData[]> GetEvents()
      {
          EventApiData[] list = new EventApiData[0]; //?

          logger.LogInformation($"GET api/events: get all events");

          // call aggregator grain

          await ConnectClientIfNeeded();
          var grain = this.client.GetGrain<IAggregatorGrain>(Guid.Empty);

          return list;
      }


      // GET /api/events/filter/{active|future|past} - return a list of events filtered to timeframe 
      [HttpGet("filter/{filter}")]
      public async Task<EventApiData[]> GetFilteredEvents(string filter)
      {
          EventApiData[] list = new EventApiData[0]; //?

          logger.LogInformation($"GET api/events/filer/{filter}");

          // call aggregator grain

          await ConnectClientIfNeeded();
          var grain = this.client.GetGrain<IAggregatorGrain>(Guid.Empty);




          return list;
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
