using GrainInterfaces;
using GrainModels;
using Orleans;
using System;
using System.Threading.Tasks;

namespace Grains
{
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
