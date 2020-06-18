using System;
using GrainInterfaces;
using GrainModels;
using Orleans;
using System.Collections.Generic;
using System.Threading.Tasks;
using Orleans.Providers;


namespace Grains
{
  
  // main event grain

  [StorageProvider(ProviderName = "grain-store")]  // we will use auto persist for event grains
  public class EventGrain : Grain<EventGrainState>, IEventGrain
  {
        // create / update an event
        //  the system doesn't really distinguish between the two, just to keep the logic simple
        //  scenarios include changing the start or end date, changing the list of topics for that event, etc
        public async Task Update(string title, string type, string start, string end, TopicApiData[] topics)
        { 
            string id = this.GetPrimaryKeyString();  // rmember - the grain key is the event id 
            Console.WriteLine($"** EventGrain Update()for event id = {id}, with title {title}");

            // update interal grain state

            State.title = title;
            State.type = type;
            State.start = start;
            State.end = end;
            State.topics = topics;
            State.feedback = new List<FeedbackGrainState>();  //  lets clear all feedback, just to keep things simple

            Console.WriteLine($"** EventGrain Update() about to write WriteStateAsync");
            await base.WriteStateAsync(); 

            // update aggregator about this new event

            SummaryEventInfo eventInfo = new SummaryEventInfo(); 
            eventInfo.id = id;
            eventInfo.title = title;
            eventInfo.start = start;
            eventInfo.end = end;

            IAggregatorGrain aggregator = GrainFactory.GetGrain<IAggregatorGrain>(Guid.Empty);  // the aggregator grain is a singleton - Guid.Empty is convention to indicate this
            //await aggregator.DeleteAnEvent(id);  
            await aggregator.AddAnEvent(eventInfo);

            return;
        }


      // return core info about this event
      public async Task<EventApiData> Info()
      {
          Console.WriteLine($"** EventGrain Info() for topicId = {this.GetPrimaryKeyString()}");

          EventApiData info = new EventApiData();

          info._id = this.GetPrimaryKeyString(); // make sure we return the grain key as event id
          info.title = State.title;
          info.type = State.type;
          info.start = State.start;
          info.end = State.end;
          info.topics = State.topics;

          return info;
      }


      // store user feedback for this event
      public async Task<int> SubmitFeedback(int topicId, int rating, string comment)
      {
            Console.WriteLine($"** Event Grain SubmitFeedback() topicId = {topicId}, into topic queue length {State.topics.Length+1} ");

            // check topic is valid
            if (topicId < 1 || topicId > State.topics.Length)
                return 300;   

            if (State.feedback == null)
                State.feedback = new List<FeedbackGrainState>();  // belt and barces in cas efeedback hasn't been initialised

            // store feedback
            FeedbackGrainState f = new FeedbackGrainState();
            f.topicId = topicId;
            f.rating = rating;
            f.comment = comment;
            State.feedback.Add(f);

            Console.WriteLine($"** Event Grain SubmitFeedback() about to write WriteStateAsync for {topicId}, with rating of {rating} {comment}");
            await base.WriteStateAsync();

            return 200; 
      }



    // return all the feedback details for a specific topic 
    public async Task<FeedbackApiData[]> GetFeedback(int thisTopic)
    {
        if (State.feedback == null)
            State.feedback = new List<FeedbackGrainState>();  // belt and barces in cas efeedback hasn't been initialised

        List<FeedbackApiData> topicSpecificFeedback = new List<FeedbackApiData>();  // output list of topic specific feedback 

        foreach (FeedbackGrainState f in State.feedback)
        {
            if (f.topicId == thisTopic)
            {
                // add it to the  list
                topicSpecificFeedback.Add(new FeedbackApiData
                {
                      _id = "",  // ?
                      Event = this.GetPrimaryKeyString(),
                      topic = thisTopic,
                      rating = f.rating,
                      comment = f.comment,
                      sentiment = ""
                });
            }
        }

        // return

        FeedbackApiData[] ret = topicSpecificFeedback.ToArray();
        return ret;
    }

  }
}
