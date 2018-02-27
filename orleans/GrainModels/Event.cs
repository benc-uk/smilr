using System;

namespace GrainModels
{
    public class Event
    {
        public string id { get; set; }
        public string title { get; set; }
        public string type { get; set; }
        public string start { get; set; }
        public string end { get; set; }
        public Topic[] topics { get; set; }
    }

    public class Topic
    {
        public string id { get; set; }
        public string desc { get; set; }        
    }
}
