using DataGateway.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Fabric.Query;
using System.Linq;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace DataGateway.Controllers
{
  [Produces("application/json")]
  [Route("api/Events")]
  public class EventsController : Controller
  {
    private readonly HttpClient httpClient;
    private readonly StatelessServiceContext serviceContext;
    private readonly ConfigSettings configSettings;
    private readonly FabricClient fabricClient;
    private readonly string serviceUri;

    public EventsController(StatelessServiceContext serviceContext, HttpClient httpClient, FabricClient fabricClient, ConfigSettings settings)
    {
      this.serviceContext = serviceContext;
      this.httpClient = httpClient;
      this.configSettings = settings;
      this.fabricClient = fabricClient;
      this.serviceUri = this.serviceContext.CodePackageActivationContext.ApplicationName + "/" + this.configSettings.StatefulEventServiceName;
    }

    // GET api/events
    [HttpGet]
    public async Task<IActionResult> GetAsync()
    {
      var result = new List<SmilrEvent>();

      // the stateful service service may have more than one partition.
      // this sample code uses a very basic loop to aggregate the results from each partition to illustrate aggregation.
      // note that this can be optimized in multiple ways for production code.
      ServicePartitionList partitions = await this.fabricClient.QueryManager.GetPartitionListAsync(new Uri(serviceUri));

      foreach (Partition partition in partitions)
      {
        var proxyUrl = GetEventStoreUri(partition);

        HttpResponseMessage response = await this.httpClient.GetAsync(proxyUrl);

        if (response.StatusCode != System.Net.HttpStatusCode.OK)
        {
          // if one partition returns a failure, you can either fail the entire request or skip that partition.
          return this.StatusCode((int)response.StatusCode);
        }

        //Convert this into the format expected from Node
        var list = JsonConvert.DeserializeObject<List<SmilrEvent>>(await response.Content.ReadAsStringAsync());

        if (list != null && list.Any())
        {
          result.AddRange(list);
        }
      }

      return this.Json(result);
    }

    // GET api/events/filter:time
    [HttpGet("filter/{time}")]
    public async Task<IActionResult> Filter(string time)
    {
      long partitionKey = GetFilterPartitionKey(time);
      var proxyUrl = GetEventStoreUri("/api/events", ServicePartitionKind.Int64Range, partitionKey);

      HttpResponseMessage response = await this.httpClient.GetAsync(proxyUrl);

      if (response.StatusCode != System.Net.HttpStatusCode.OK)
      {
        // if one partition returns a failure, you can either fail the entire request or skip that partition.
        return this.StatusCode((int)response.StatusCode);
      }

      return this.Json(JsonConvert.DeserializeObject<List<SmilrEvent>>(await response.Content.ReadAsStringAsync()));
    }

    // GET api/events/5
    [HttpGet("{eventId}")]
    public async Task<IActionResult> Get(string eventId)
    {
      int partitionKey;

      try
      {
        // Should we validate this in the UI or here in the controller?
        if (!String.IsNullOrEmpty(eventId))
        {
          //Let's assume we can only give feedback on active events
          partitionKey = GetFilterPartitionKey("active");
        }
        else
        {
          throw new ArgumentException("No key provided");
        }
      }
      catch (Exception ex)
      {
        return new ContentResult { StatusCode = 400, Content = ex.Message };
      }

      var proxyUrl = GetEventStoreUri($"/api/events/{eventId}", ServicePartitionKind.Int64Range, partitionKey);

      HttpResponseMessage response = await this.httpClient.GetAsync(proxyUrl);

      if (response.StatusCode != System.Net.HttpStatusCode.OK)
      {
        // if one partition returns a failure, you can either fail the entire request or skip that partition.
        return this.StatusCode((int)response.StatusCode);
      }

      return this.Json(JsonConvert.DeserializeObject<SmilrEvent>(await response.Content.ReadAsStringAsync()));
    }

    // PUT api/values
    [HttpPut]
    [HttpPost]
    public async Task<IActionResult> PutAsync([FromBody] SmilrEvent smilrEvent)
    {
      int partitionKey;

      try
      {
        string key = smilrEvent.start;

        // Should we validate this in the UI or here in the controller?
        if (!String.IsNullOrEmpty(key))
        {
          partitionKey = GetPartitionKey(key);
        }
        else
        {
          throw new ArgumentException("No key provided");
        }
      }
      catch (Exception ex)
      {
        return new ContentResult { StatusCode = 400, Content = ex.Message };
      }

      //Where
      var proxyUrl = GetEventStoreUri($"/api/events/{smilrEvent.id}", ServicePartitionKind.Int64Range, partitionKey);

      //What
      StringContent putContent = new StringContent(JsonConvert.SerializeObject(smilrEvent), Encoding.UTF8, "application/json");
      putContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

      HttpResponseMessage response = await this.httpClient.PutAsync(proxyUrl, putContent);

      return new ContentResult()
      {
        StatusCode = (int)response.StatusCode,
        Content = await response.Content.ReadAsStringAsync()
      };
    }

    // DELETE api/events/5
    [HttpDelete("{id}")]
    public void Delete(int id)
    {
      throw new NotImplementedException("No method implemented to delete a specified key/value pair in the Stateful Backend Service");
    }


    private Uri GetEventStoreUri(string api, ServicePartitionKind servicePartitionKind, long partitionKey)
    {
      return new Uri($"http://localhost:{this.configSettings.ReverseProxyPort}/{serviceUri.Replace("fabric:/", "")}{api}?PartitionKind={servicePartitionKind}&PartitionKey={partitionKey}");
    }
    private Uri GetEventStoreUri(Partition partition)
    {
      long partitionKey = ((Int64RangePartitionInformation)partition.PartitionInformation).LowKey;
      return GetEventStoreUri("/api/events", partition.PartitionInformation.Kind, partitionKey);
    }

    private static int GetPartitionKey(string startDate)
    {
      // The partitioning scheme of the processing service is a range of integers from 1 - 12.
      // This generates a partition key within that range by converting the month of the event
      // into its numerica position.
      if (!int.TryParse(startDate.Split('-')[1], out int result))
      {
        throw new ArgumentException("The key must be a valid numerical date");
      }

      return result;
    }

    private static int GetFilterPartitionKey(string filter)
    {
      if (string.CompareOrdinal(filter, "past") == 0)
      {
        return DateTime.Now.Month - 1;
      }
      if (string.CompareOrdinal(filter, "active") == 0)
      {
        return DateTime.Now.Month;
      }
      if (string.CompareOrdinal(filter, "future") == 0)
      {
        return DateTime.Now.Month + 1;
      }

      return 12; // Hardcoded for December
    }
  }
}
