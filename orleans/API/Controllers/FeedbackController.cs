using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using GrainInterfaces;
using Orleans;
using Microsoft.Extensions.Logging;
using GrainModels;

namespace API.Controllers
{
    [Produces("application/json")]
    [Route("api/feedback")]
    public class FeedbackController : Controller
    {
        private IClusterClient client;
        private readonly ILogger logger;

        public FeedbackController(IClusterClient client, ILogger<EventsController> logger)
        {
            this.client = client;
            this.logger = logger;
        }


        // GET /api/feedback/{eventid}/{topicid} - Return all feedback for specific event and topic
        [HttpGet("{eventid}/{topicid}", Name = "Get")]
        public async Task<FeedbackApiData[]> Get(string eventid, int topicid)
        {
            logger.LogInformation($"GET /api/feedback: eventid {eventid}, topicid {topicid}");

            // call approprate grain to get all feedback for a specific topic id

            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IEventGrain>(eventid);  // grains are keyed on event id
            FeedbackApiData[] f = await grain.GetFeedback(topicid);

            return f;
        }
        

        // POST /api/Feedback - submit feedback for an event + topic
        [HttpPost]
        public async Task Post([FromBody] FeedbackApiData body)
        {
            logger.LogInformation($"POST /api/feedback: incoming feedback for event {body.Event}, topic {body.topic}, comment {body.comment}");

            string eventid = body.Event;
            if (eventid == "")
            {
              Response.StatusCode = 400;
              return;  
            }

            // call grain with payload

            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IEventGrain>(eventid);
            int state;
            state = await grain.SubmitFeedback(body.topic, body.rating, body.comment);

            return;
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
