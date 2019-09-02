using GrainInterfaces;
using GrainModels;
using Orleans;
using System.Collections.Generic;
using System.Threading.Tasks;


namespace Grains
{
  
  // main event grain

  [Orleans.Providers.StorageProvider(ProviderName = "grain-store")]  // we will us auto persist for event grains
  public class EventGrain : Grain<EventGrainState>, IEventGrain
  {
      List<FeedbackGrainState> feebdack;


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
          await base.WriteStateAsync();
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


      // store user feedback for this event
      public async Task SubmitFeedback(int topicId, int rating, string comment)
      {
          // check topic is valid
          if (topicId > State.topics.Length)
              return;  // should we surface error?

          // store feedback
          FeedbackGrainState f = new FeedbackGrainState();
          f.topicId = topicId;
          f.rating = rating;
          f.comment = comment;
          State.feedback.Add(f);

          return;
      }



      public async Task<FeedbackAPI> GetFeedback(int topicid)
      {
          FeedbackAPI f = new FeedbackAPI();

          // TODO - write!

          return f;
      }

  }
}
