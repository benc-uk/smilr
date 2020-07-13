using System;
using System.Text;
using System.Security.Cryptography;
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
            string eventCode = makeId(body.title, 6);
            logger.LogInformation($"-- POST /api/events: Create new event, incoming body title = {body.title}, assigned to event code {eventCode}");

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
            logger.LogInformation($"-- PUT /api/events: Update existing event, event code = {eventCode}, body title = {body.title}");

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
            logger.LogInformation($"-- GET api/events/id: event id = {id}");

            EventApiData info = new EventApiData();

            // check if event exists, so as not to create an empty grain  

            await ConnectClientIfNeeded();
            var agggrain = this.client.GetGrain<IAggregatorGrain>(Guid.Empty);
            int index = await agggrain.IsAnEvent(id);
            if (index < 0)
                return info;  // empty 

            // call event grain

            await ConnectClientIfNeeded();
            var eventgrain = this.client.GetGrain<IEventGrain>(id);
            info = await eventgrain.Info();
                
            return info;
        }

    
        // GET /api/events - return a list of all events
        [HttpGet("")]
        public async Task<EventApiData[]> GetEvents()
        {
            //EventApiData[] list = new EventApiData[0]; 

            logger.LogInformation($"-- GET api/events: get all events");

            // call aggregator grain

            await ConnectClientIfNeeded();
            var agggrain = this.client.GetGrain<IAggregatorGrain>(Guid.Empty);
            EventApiData[] list = await agggrain.ListEvents("");

            return list;
        }


        // GET /api/events/filter/{active|future|past} - return a list of events filtered to timeframe 
        [HttpGet("filter/{filter}")]
        public async Task<EventApiData[]> GetFilteredEvents(string filter)
        {
            //EventApiData[] list = new EventApiData[0]; //?

            logger.LogInformation($"-- GET api/events/filer/{filter}");

            // call aggregator grain

            await ConnectClientIfNeeded();
            var agggrain = this.client.GetGrain<IAggregatorGrain>(Guid.Empty);
            EventApiData[] list = await agggrain.ListEvents(filter);

            return list;
        }


        // Simple deterministic random ID generator
        private string makeId(string title, int len)
        {
            var id = "";
            var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

            int seed = GetMd5Hash(title);  // want to make this deterministic for testing 
            Random rand = new Random(seed);
            for (var i = 0; i < len; i++)
                id += possible[rand.Next(0, possible.Length - 1)];

            return id;
        }


        // simple MD5 Hash function 
        private int GetMd5Hash(string input)
        {
            MD5 md5Hash = MD5.Create();

            // Convert the input string to a byte array and compute the hash.
            byte[] data = md5Hash.ComputeHash(Encoding.UTF8.GetBytes(input));

            // Create a new Stringbuilder to collect the bytes
            StringBuilder sBuilder = new StringBuilder();

            // Loop through each byte of the hashed data and format each one as a hexadecimal string.
            for (int i = 0; i < data.Length; i++)
            {
                sBuilder.Append(data[i].ToString("x2"));
            }

            // convert to int
            string s1 = sBuilder.ToString();
            string s2 = s1.Substring(0, 6);
            int num = Int32.Parse(s2, System.Globalization.NumberStyles.HexNumber);

            return num;
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


    [Produces("application/json")]
    [Route("api/health")]
    public class HealthController : Controller
    {
        private IClusterClient client;
        private readonly ILogger logger;

        public HealthController(IClusterClient client, ILogger<EventsController> logger)
        {
            this.client = client;
            this.logger = logger;
        }

        // GET /api/health - health point and system info
        [HttpGet("")]
        public async Task<string> GetHealth()
        {
            logger.LogInformation($"-- GET api/health");

            return "Project Orleans";
        } 
    }
}
