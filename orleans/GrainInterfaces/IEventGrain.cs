using GrainModels;
using Orleans;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GrainInterfaces
{

  // event grain interface
    public interface IEventGrain : IGrainWithStringKey
    {
        // initialise/update a grain with the core event info 
        Task Update(string title, string type, string start, string end, TopicAPI[] topics);

        // return event info 
        Task<EventAPI> Info();

        // submit event + topic feedback 
        Task SubmitFeedback(int topic, int rating, string comment);

        // get all feedback for specific topic
        Task<FeedbackAPI> GetFeedback(int topicid);

  }
}
