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
    //  scenarios include changing the start or endd date, changing the list of topics for that event, etc
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


    // return core info about this event
    public async Task<EventAPI> Info()
    {
      EventAPI info = new EventAPI();

      info.id = this.GetPrimaryKeyString(); // make sure we return this grain key as event id
      info.title = State.title;
      info.type = State.type;
      info.start = State.start;
      info.end = State.end;
      info.topics = State.topics;

      return info;
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
