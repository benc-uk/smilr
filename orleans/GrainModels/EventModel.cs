using System.Collections.Generic;


namespace GrainModels
{
    // Web API data models


    // event and topics for event creation & update 
    public class EventAPI
    {
        public string _id { get; set; }  // event key
        public string title { get; set; }
        public string type { get; set; }
        public string start { get; set; }
        public string end { get; set; }
        public TopicAPI[] topics { get; set; }
    }

    // topic info
    public class TopicAPI
    {
        public int id { get; set; }
        public string desc { get; set; }
    }


    //  feedback info 
    public class FeedbackAPI
    {
        public string _id { get; set; }   // unqiue key, not sure it is used anywhere 
        public string Event { get; set; }  // event key
        public int topic { get; set; }
        public int rating { get; set; }
        public string comment { get; set; }
        public string sentiment { get; set; }
    }



  // Grain internal state 
  // this is the state that the grain needs to pesist across activations, and gets saved by Orleans via the grain persistence API 
  // dotnet.github.io/orleans/Tutorials/Declarative-Persistence.html 

    public class EventGrainState
    {
        public string id { get; set; }
        public string title { get; set; }
        public string type { get; set; }
        public string start { get; set; }
        public string end { get; set; }
        public TopicAPI[] topics { get; set; }
        public List<FeedbackGrainState> feedback { get; set; }
    }

    public class FeedbackGrainState 
    {
        public int topicId { get; set; }      // which Topic id the feedback refers to 
        public int rating { get; set; }       // thew actual rating 
        public string comment { get; set; }   // optional comment     
    }
}
