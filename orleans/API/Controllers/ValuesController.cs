using System;
using System.Collections.Generic;
using System.Linq;
using System.Threading.Tasks;
using GrainInterfaces;
using Microsoft.AspNetCore.Mvc;
using Orleans;
using Microsoft.Extensions.Logging;

namespace API.Controllers
{
    [Route("api/[controller]")]
    public class ValuesController : Controller
    {
        private IClusterClient client;
        private readonly ILogger logger;
        
        public ValuesController(IClusterClient client, ILogger<ValuesController> logger)
        {
            this.client = client;
            this.logger = logger;
        }

        // GET api/values
        [HttpGet]
        public IEnumerable<string> Get()
        {
            logger.LogInformation("GET ALL");
            return new string[] { "value1", "value2" };
        }

        // GET api/values/5
        [HttpGet("{id}")]
        public async Task<string> Get(int id)
        {
            logger.LogInformation($"GET {id}");
            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IValueGrain>(id);
            return await grain.GetValue();
        }

        // PUT api/values/5
        [HttpPut("{id}")]
        public async Task Put(int id, [FromBody]dynamic value)
        {
            logger.LogInformation($"PUT {id} = {value}");
            await ConnectClientIfNeeded();
            var grain = this.client.GetGrain<IValueGrain>(id);
            await grain.SetValue(value.ToString());
        }

        private async Task ConnectClientIfNeeded()
        {
            if (!this.client.IsInitialized)
                await this.client.Connect();
        }
    }
}
