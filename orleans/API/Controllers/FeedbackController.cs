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
    [Route("api/Feedback")]
    public class FeedbackController : Controller
    {
        private IClusterClient client;
        private readonly ILogger logger;

        public FeedbackController(IClusterClient client, ILogger<EventsController> logger)
        {
            this.client = client;
            this.logger = logger;
        }



        // GET /api/feedback/{eventid}/{topicid} - Return all feedback for given event and topic
        [HttpGet("{eventid}/{topicid}", Name = "Get")]
        public async Task<FeedbackAPI> Get(string eventid, int topicid)
        {
            logger.LogInformation($"GET /api/feedback: eventid {eventid}, topicid {topicid}");

            // call grain
            FeedbackAPI f;
            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IEventGrain>(eventid);
            f = await grain.GetFeedback(topicid);

            return f;
        }
        
        // POST: api/Feedback
        //  submit user feedback for an event + topic
        [HttpPost]
        public async Task Post([FromBody] FeedbackAPI body)
        {
            logger.LogInformation($"POST /api/feedback: incoming body = {body}");

            // call grain with payload
            string eventCode = body.Event;
            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IEventGrain>(eventCode);
            await grain.SubmitFeedback(body.topic, body.rating, body.comment);

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
