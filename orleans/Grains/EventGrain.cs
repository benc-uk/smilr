using GrainInterfaces;
using GrainModels;
using Orleans;
using System;
using System.Threading.Tasks;

namespace Grains
{
  
  // main event grain

  [Orleans.Providers.StorageProvider(ProviderName = "grain-store")]  // we will us auto persist for event grains
  public class EventGrain : Grain<EventGrainState>, IEventGrain
  {


    // create / update an event
    //  the system doesn't really distinguish between the two, just to keep the logic simple
    //  scenarios include chnaging the start or endd date, changing the list of topics for that event, etc

    public async Task Update(string title, string type, string start, string end, TopicAPI[] topics)
    {
        // store state
        State.title = title;
        State.type = type;
        State.start = start;
        State.end = end;
        State.topics = topics;

          
        return; 
    }


    /* 
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
    */

    /*public Task SetValue(string value)
    {
      State.value = value;
      base.WriteStateAsync();
      return Task.CompletedTask;
    }*/
  }
}
