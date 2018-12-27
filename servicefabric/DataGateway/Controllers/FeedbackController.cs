using DataGateway.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Newtonsoft.Json;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Net.Http;
using System.Net.Http.Headers;
using System.Text;
using System.Threading.Tasks;

namespace DataGateway.Controllers
{
  [Produces("application/json")]
  [Route("api/Feedback")]
  public class FeedbackController : Controller
  {

    private readonly HttpClient httpClient;
    private readonly StatelessServiceContext serviceContext;
    private readonly ConfigSettings configSettings;
    private readonly FabricClient fabricClient;
    private readonly Uri serviceUri;

    public FeedbackController(StatelessServiceContext serviceContext, HttpClient httpClient, FabricClient fabricClient, ConfigSettings settings)
    {
      this.serviceContext = serviceContext;
      this.httpClient = httpClient;
      this.configSettings = settings;
      this.fabricClient = fabricClient;
      this.serviceUri = new Uri(this.serviceContext.CodePackageActivationContext.ApplicationName + "/" + this.configSettings.StatefulFeedbackServiceName);
    }

    // GET api/feedback/{eventid}/{topicid}
    [HttpGet("{eventId}/{topicId}")]
    public async Task<IActionResult> GetAsync(string eventId, string topicId)
    {
      var proxyUrl = this.GetFeedbackStoreUri($"/api/feedback/{eventId}/{topicId}?PartitionKind=Int64Range&PartitionKey=0");

      HttpResponseMessage response = await this.httpClient.GetAsync(proxyUrl);

      if (response.StatusCode != System.Net.HttpStatusCode.OK)
      {
        // if one partition returns a failure, you can either fail the entire request or skip that partition.
        return this.StatusCode((int)response.StatusCode);
      }

      return this.Json(JsonConvert.DeserializeObject<List<Feedback>>(await response.Content.ReadAsStringAsync()));
    }

    // POST api/feedback
    [HttpPost]
    public async Task<IActionResult> PostAsync([FromBody] Feedback feedback)
    {
      feedback.id = Guid.NewGuid().ToString();
      var proxyUrl = this.GetFeedbackStoreUri($"/api/feedback?PartitionKind=Int64Range&PartitionKey=0");

      var putContent = new StringContent(JsonConvert.SerializeObject(feedback), Encoding.UTF8, "application/json");
      putContent.Headers.ContentType = new MediaTypeHeaderValue("application/json");

      HttpResponseMessage response = await this.httpClient.PostAsync(proxyUrl, putContent);

      return new ContentResult()
      {
        StatusCode = (int)response.StatusCode,
        Content = await response.Content.ReadAsStringAsync()
      };
    }

    private Uri GetFeedbackStoreUri(string suffix)
    {
      return new Uri($"http://localhost:{this.configSettings.ReverseProxyPort}/{this.serviceUri.ToString().Replace("fabric:/", "")}{suffix}");
    }
  }
}
