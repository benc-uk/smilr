using FeedbackStore.ViewModels;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;
using System;
using System.Collections.Generic;
using System.Fabric;
using System.Threading;
using System.Threading.Tasks;

namespace FeedbackStore.Controllers
{
  [Produces("application/json")]
  [Route("api/Feedback")]
  public class FeedbackController : Controller
  {
    private static readonly Uri ValuesDictionaryName = new Uri("store:/feedback");

    private readonly IReliableStateManager stateManager;

    public FeedbackController(IReliableStateManager stateManager)
    {
      this.stateManager = stateManager;
    }

    // GET api/feedback/evt01/1
    [HttpGet("{eventId}/{topicId}")]
    public async Task<IActionResult> Get(string eventId, string topicId)
    {
      try
      {
        List<Feedback> result = new List<Feedback>();

        var tryGetResult = await this.stateManager.TryGetAsync<IReliableDictionary<string, Feedback>>(ValuesDictionaryName);

        if (tryGetResult.HasValue)
        {
          IReliableDictionary<string, Feedback> dictionary = tryGetResult.Value;

          using (ITransaction tx = this.stateManager.CreateTransaction())
          {
            var enumerable = await dictionary.CreateEnumerableAsync(tx);
            var enumerator = enumerable.GetAsyncEnumerator();

            while (await enumerator.MoveNextAsync(CancellationToken.None))
            {
              result.Add(enumerator.Current.Value);
            }
          }
        }
        return this.Json(result);
      }
      catch (FabricException)
      {
        return new ContentResult { StatusCode = 503, Content = "The service was unable to process the request. Please try again." };
      }
    }

    // POST api/feedback
    [HttpPost]
    public async Task<IActionResult> PostAsync([FromBody]Feedback feedback)
    {
      try
      {
        var dictionary = await this.stateManager.GetOrAddAsync<IReliableDictionary<string, Feedback>>(ValuesDictionaryName);

        using (ITransaction tx = this.stateManager.CreateTransaction())
        {
          await dictionary.SetAsync(tx, feedback.id, feedback);
          await tx.CommitAsync();
        }

        return this.Ok();
      }
      catch (FabricNotPrimaryException)
      {
        return new ContentResult { StatusCode = 410, Content = "The primary replica has moved. Please re-resolve the service." };
      }
      catch (FabricException)
      {
        return new ContentResult { StatusCode = 503, Content = "The service was unable to process the request. Please try again." };
      }
    }
  }
}
