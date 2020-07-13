using GrainModels;
using Orleans;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GrainInterfaces
{
    // event grain interface, one grain per event
    public interface IEventGrain : IGrainWithStringKey
    {
        // initialise/update a grain with the core event info 
        Task Update(string title, string type, string start, string end, TopicApiData[] topics);

        // return event info 
        Task<EventApiData> Info();

        // submit event + topic feedback 
        Task<int> SubmitFeedback(int topic, int rating, string comment);

        // get all feedback for specific topic
        Task<FeedbackApiData[]> GetFeedback(int topicid);
    } 


    // aggregator interface, one aggregator grain per system for all events 
    public interface IAggregatorGrain : IGrainWithGuidKey
    {   
        // does a specfic event exist? -1 no, >=0 yes 
         Task<int> IsAnEvent(string id);

        // add a new event to the list of events
        Task AddAnEvent(SummaryEventInfo eventInfo);

        // delete an event from the list of events
        Task DeleteAnEvent(string id);

        // return array of events matching passed in filter
        Task<EventApiData[]> ListEvents(string filter);
    } 
}
