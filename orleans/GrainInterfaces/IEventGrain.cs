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
        Task Update(string title, string type, string start, string end, TopicAPI[] topics);

        // return event info 
        Task<EventAPI> Info();

        // submit event + topic feedback 
        Task<int> SubmitFeedback(int topic, int rating, string comment);

        // get all feedback for specific topic
        Task<FeedbackAPI[]> GetFeedback(int topicid);
    } 



    // aggregator interface, one grain per system for all events 
    public interface IAggregatorGrain : IGrainWithGuidKey
    {
        // add a new event to the list of events
        Task AddAnEvent(string eventid);

        // delete an event from the list of events
        Task DeleteAnEvent(string eventid);

        // return array of events matching filter
        Task<EventAPI[]> ListEvents(string filter);
    } 
}
