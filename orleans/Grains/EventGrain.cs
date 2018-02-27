using GrainInterfaces;
using GrainModels;
using Orleans;
using System;
using System.Threading.Tasks;

namespace Grains
{
  /*public class EventGrainState
  {
    id:     any       // Six character UID string or int
    title:  string    // Title of the event, 50 char max
    type:   string    // Type of event ['event', 'workshop', 'hack', 'lab']
    start:  Date      // Start date, an ISO 8601 string; YYYY-MM-DD
    end:    Date      // End date, an ISO 8601 string; YYYY-MM-DD
    topics: Topic[];  // List of Topics, must be at least one

    public string value { get; set; } = "grain-not-set";
  }*/

  [Orleans.Providers.StorageProvider(ProviderName = "grain-store")]
  public class EventGrain : Grain<GrainModels.Event>, IEventGrain
  {
    public Task<string> GetTitle()
    {
      // Getting it from GrainState, is that bad? I don't think so unless I call base.ReadStateAsync();
      base.ReadStateAsync();
      return Task.FromResult(State.title.ToString());
    }

    public Task SetTitle(string title)
    {
      // Getting it from GrainState, is that bad? I don't think so unless I call base.ReadStateAsync();
      State.title = title;
      base.WriteStateAsync();
      return Task.CompletedTask;
    }

    /*public Task SetValue(string value)
    {
      State.value = value;
      base.WriteStateAsync();
      return Task.CompletedTask;
    }*/
  }
}
