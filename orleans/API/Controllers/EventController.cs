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
  public class EventsController : Controller
  {
    private IClusterClient client;
    private readonly ILogger logger;

    public EventsController(IClusterClient client, ILogger<ValuesController> logger)
    {
      this.client = client;
      this.logger = logger;
    }

    // GET api/events - Return all events. Ummm somehow...
    [HttpGet]
    public IEnumerable<string> Get()
    {
      logger.LogInformation("GET ALL");
      return new string[] { "value1", "value2" };
    }
  }
}