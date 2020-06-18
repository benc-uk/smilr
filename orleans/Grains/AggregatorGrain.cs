using System;
using GrainInterfaces;
using GrainModels;
using Orleans;
using System.Collections.Generic;
using System.Threading.Tasks;
using Orleans.Providers;


namespace Grains
{
    // The aggragtor grain maintains a list of all valid events, for cross event queries
    // For a technology demonstrator, a single grain with a list of events this is fine, but a real world system maywe  choose to have multiple 
    // aggregators, one per silo and roll them up - https://dotnet.github.io/orleans/Documentation/frequently_asked_questions.html
    // By convention, the graind identity for the aggregator grain is 'Guid.Empty'
    // The aggregator needs to store core info including the topics, due to the way the UI designed to
    // work, to enable a drill down into the actual feedback, so there is comesome duplication of data between
    // the aggregator and actual event grain 

    [StorageProvider(ProviderName = "grain-store")]  
    public class AggregatorGrain : Grain<AggregatorGrainState>, IAggregatorGrain
    {
        // does a specfic event id exist? -1 if not, zero or greater if it
        public async Task<int> IsAnEvent(string id)
        {
            Console.WriteLine($"** AggregatorGrain IsAnEvent() for event id {id}");

            // ensure allevent List is constructed ok 
            if (State.allevents == null)
                State.allevents = new List<SummaryEventInfo>();

            int index = State.allevents.FindIndex(x => x.id == id);

            return index;
        }


        // add event id to event list
        public async Task AddAnEvent(SummaryEventInfo eventInfo)
        {
            Console.WriteLine($"** AggregatorGrain AddAnEvent() for event id {eventInfo.id}, title {eventInfo.title}");

            // ensure allevent List is constructed ok 
            if (State.allevents == null)
                State.allevents = new List<SummaryEventInfo>();


            // check to see if event already exists, and if so, removed, before inserting new event info
            int index = State.allevents.FindIndex(item => item.id == eventInfo.id);
            if (index >= 0)
                State.allevents.RemoveAt(index); 

            // add this event key to our active list
            State.allevents.Add(eventInfo);

            Console.WriteLine($"** AggregatorGrain AddAnEvent() about to write WriteStateAsync for new event id {eventInfo.id}");
            await base.WriteStateAsync(); 

            return; 
        }


        // delete specific event from the aggregator event list
        public async Task DeleteAnEvent(string id)
        {
            Console.WriteLine($"** AggregatorGrain DeleteAnEvent() for event id {id}");

            // check args
            if (id == "")
                return;  // nothing to do

            if (State.allevents == null)
                State.allevents = new List<SummaryEventInfo>(); // ensure allevent List is constructed ok 

            // delete this event key from our active list if it exists 
            int index = State.allevents.FindIndex(item => item.id == id);
            if (index >= 0)
            {
                State.allevents.RemoveAt(index);  // remove it

                Console.WriteLine($"** Aggregator Grain DeleteAnEvent() about to write WriteStateAsync for deleted event id {id}");
                await base.WriteStateAsync(); 
            }

            return;
        }


        // return filtered list of events. filter = ""|active|future|past
        public async Task<EventApiData[]> ListEvents(string filter)
        {
            Console.WriteLine($"** AggregatorGrain ListEvents for filter '{filter}'");

            if (State.allevents == null)
                State.allevents = new List<SummaryEventInfo>(); // ensure allevent List is constructed ok 
            List<EventApiData> filteredevents = new List<EventApiData>();  //  list of matching events to output
            DateTime today = DateTime.Today;  // baseline to compare with

            // loop through every event we have and check if it matches filter 

            foreach (SummaryEventInfo e in State.allevents)
            {
                DateTime eventdate = DateTime.Parse(e.start);       // extract event date
                int result = DateTime.Compare(today, eventdate);    // <0 for future, 0 for today, >0 for past

                // check if event matches filter
                
                Boolean add = false;
                if (filter == "active")
                {
                    if (result == 0) add = true;  // add if today
                }
                else if (filter == "future")
                {
                    if (result < 0) add = true;
                }
                else if (filter == "past")
                {
                    if (result > 0) add = true;
                }
                else
                    add = true;  // default for empty string or bad string

                // add matched event 

                if (add)
                {
                    filteredevents.Add(new EventApiData() { _id = e.id, title = e.title, start = e.start, end = e.end, type = ""});
                }
            }

            // return back as array
            EventApiData[] ret = filteredevents.ToArray();
            return ret;
        }
    } 
}