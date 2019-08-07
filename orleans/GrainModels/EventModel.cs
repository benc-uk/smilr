using System.Collections.Generic;


namespace GrainModels
{

  // Web API models


  // event and topics for event creation and update 
  public class EventAPI
  {
    public string id { get; set; }  // event key
    public string title { get; set; }
    public string type { get; set; }
    public string start { get; set; }
    public string end { get; set; }
    public TopicAPI[] topics { get; set; }
  }

  public class TopicAPI
  {
    public int id { get; set; }
    public string desc { get; set; }
  }



  // feedback
  // Submit feedback
  public class FeedbackAPI
  {
    public string Event { get; set; }  // event key
    public int topic { get; set; }
    public int rating { get; set; }
    public string comment { get; set; }
  }





  // Grains

  // this is the grain state that gets saved by Orleans via the grain persistence api - https://dotnet.github.io/orleans/Documentation/Core-Features/Grain-Persistence.html
  //  it need to handle all the event, topics and feedback data the grain manages
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
    public int topicId { get; set; }      // links back to which Topic id the feedback refers to 
    public int rating { get; set; }    // required
    public string comment { get; set; }   // optional     
  }



}
