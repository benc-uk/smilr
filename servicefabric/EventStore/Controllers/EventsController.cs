using System;
using System.Collections.Generic;
using System.Fabric;
using System.Linq;
using System.Threading;
using System.Threading.Tasks;
using EventStore.ViewModels;
using Microsoft.AspNetCore.Http;
using Microsoft.AspNetCore.Mvc;
using Microsoft.ServiceFabric.Data;
using Microsoft.ServiceFabric.Data.Collections;

namespace EventStore.Controllers
{
  [Produces("application/json")]
  [Route("api/Events")]
  public class EventsController : Controller
  {
    private static readonly Uri ValuesDictionaryName = new Uri("store:/events");

    private readonly IReliableStateManager stateManager;

    public EventsController(IReliableStateManager stateManager)
    {
      this.stateManager = stateManager;
    }

    // GET api/events
    [HttpGet]
    public async Task<IActionResult> Get()
    {
      try
      {
        var result = new List<SmilrEvent>();

        // We will get a conditional value from our reliable collection. If we don't return an empty collection.
        var tryGetResult = await this.stateManager.TryGetAsync<IReliableDictionary<string, SmilrEvent>>(ValuesDictionaryName);

        if (tryGetResult.HasValue)
        {
          var dictionary = tryGetResult.Value;

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


    // GET api/events/event01
    [HttpGet("{eventId}")]
    public async Task<IActionResult> Get(string eventId)
    {
      try
      {
        var dictionary = await this.stateManager.GetOrAddAsync<IReliableDictionary<string, SmilrEvent>>(ValuesDictionaryName);

        using (ITransaction tx = this.stateManager.CreateTransaction())
        {
          var result = await dictionary.TryGetValueAsync(tx, eventId);

          if (result.HasValue)
          {
            return this.Ok(result.Value);
          }

          return this.NotFound();
        }
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

    // POST api/events/name
    [HttpPost("{name}")]
    public async Task<IActionResult> Post(string name, [FromBody] SmilrEvent value)
    {
      try
      {
        var dictionary = await this.stateManager.GetOrAddAsync<IReliableDictionary<string, SmilrEvent>>(ValuesDictionaryName);

        using (ITransaction tx = this.stateManager.CreateTransaction())
        {
          await dictionary.SetAsync(tx, name, value);
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

    // PUT api/events/5
    [HttpPut("{name}")]
    public async Task<IActionResult> Put(string name, [FromBody] SmilrEvent value)
    {
      try
      {
        var dictionary = await this.stateManager.GetOrAddAsync<IReliableDictionary<string, SmilrEvent>>(ValuesDictionaryName);

        using (ITransaction tx = this.stateManager.CreateTransaction())
        {
          await dictionary.AddAsync(tx, name, value);
          await tx.CommitAsync();
        }
      }
      catch (ArgumentException)
      {
        return new ContentResult { StatusCode = 400, Content = $"A value with name '{name}' already exists." };
      }
      catch (FabricNotPrimaryException)
      {
        return new ContentResult { StatusCode = 410, Content = "The primary replica has moved. Please re-resolve the service." };
      }
      catch (FabricException)
      {
        return new ContentResult { StatusCode = 503, Content = "The service was unable to process the request. Please try again." };
      }

      return this.Ok();
    }

    // DELETE api/events/name
    [HttpDelete("{name}")]
    public async Task<IActionResult> Delete(string name)
    {
      var dictionary = await this.stateManager.GetOrAddAsync<IReliableDictionary<string, SmilrEvent>>(ValuesDictionaryName);

      try
      {
        using (ITransaction tx = this.stateManager.CreateTransaction())
        {
          var result = await dictionary.TryRemoveAsync(tx, name);

          await tx.CommitAsync();

          if (result.HasValue)
          {
            return this.Ok();
          }

          return new ContentResult { StatusCode = 400, Content = $"A value with name '{name}' doesn't exist." };
        }
      }
      catch (FabricNotPrimaryException)
      {
        return new ContentResult { StatusCode = 503, Content = "The primary replica has moved. Please re-resolve the service." };
      }
    }
  }
}
