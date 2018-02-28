using GrainInterfaces;
using GrainModels;
using Orleans;
using System;
using System.Threading.Tasks;

namespace Grains
{
    public class EventGrainState
    {
        public string title { get; set; }
        public string type { get; set; }
        public string start { get; set; }
        public string end { get; set; }
        public Topic[] topics { get; set; }
    }

    public class TopicGrainState
    {
        public string id { get; set; }
        public string desc { get; set; }        
    }


    public class FeedbackGrainState
    {
        public string rating { get; set; }
        public string comment { get; set; }        
    }


  // we will us auto persist for event grains
  [Orleans.Providers.StorageProvider(ProviderName = "grain-store")]
  public class EventGrain : Grain<GrainModels.Event>, IEventGrain
  {
    public async Task Launch(string title, string type, string start, string end)
    {
        State.title = title;
        State.type = type;
        State.start = start;
        State.end = end;
          
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
