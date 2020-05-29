using System.Collections.Generic;


namespace GrainModels
{
    // externally facing web API Event model
    public class EventApiData
    {
        public string _id { get; set; }         // event key used to reference the event
        public string title { get; set; }       // event title 
        public string type { get; set; }        // event type ('event', 'workshop', ...) 
        public string start { get; set; }       // ISO 8601 - YYYY-MM-DD
        public string end { get; set; }         // ISO 8601 - YYYY-MM-DD
        public TopicApiData[] topics { get; set; }  // list of topics, must be at least one
    }

    // externally facing web API Topic model
    public class TopicApiData
    {
        public int id { get; set; }             // starting at 1
        public string desc { get; set; }        // short description 
    }

    // externally facing web API Feedback model
    public class FeedbackApiData
    {
        public string _id { get; set; }         // unqiue key, not sure it is used anywhere 
        public string Event { get; set; }       // event key
        public int topic { get; set; }          // topic id, starting at 1
        public int rating { get; set; }         // feedback rating - 1 to 5
        public string comment { get; set; }     // feedback optional comment 
        public string sentiment { get; set; }   // optional  
    }



    // Grain internal state 
    // this is the state that the grain needs to pesist across activations, and gets saved by Orleans via the grain persistence API 
    // dotnet.github.io/orleans/Tutorials/Declarative-Persistence.html 
    // all event properties are set in one atomic action, except the feedback, which is incrementally collected from the users    

    // persisted event info   
    public class EventGrainState
    {
        // core event data
        public string id { get; set; }
        public string title { get; set; }
        public string type { get; set; }
        public string start { get; set; }
        public string end { get; set; }
        public TopicApiData[] topics { get; set; }

        // user feedback, added incrementally   
        public List<FeedbackGrainState> feedback { get; set; }  
    }


    // feedback data 
    public class FeedbackGrainState 
    {
        public int topicId { get; set; }      // which topic id the feedback refers to - 1..
        public int rating { get; set; }       // the actual rating 
        public string comment { get; set; }   // any optional comment     
    }


    // persisted aggregator summary event info list
    public class AggregatorGrainState
    {
        public List<SummaryEventInfo> allevents { get; set; }  // list of  events and key info needed for filtering  
    }


    //  summary event data 
    public class SummaryEventInfo
    {
        public string id { get; set; }      // event id  
        public string title { get; set; }   // event title 
        public string start { get; set; }   // start date
        public string end { get; set; }     // end date
    }


    // aggregator info about all events 
    public class AggregatorGrainState
    {
        // this is the list of known events, where each entry is the grain idendity  
        public List<SummaryEventInfo> allevents { get; set; }
    }


    // helper class for AggregatorGrainState
    public class SummaryEventInfo
    {
        public string id { get; set; }      // event id  
        public string start { get; set; }   // start date
    }
}
