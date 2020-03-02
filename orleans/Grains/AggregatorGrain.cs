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

    [StorageProvider(ProviderName = "grain-store")]  
    public class AggregatorGrain : Grain<AggregatorGrainState>, IAggregatorGrain
    {
        // add event id to event list
        public async Task AddAnEvent(string eventid)
        {
            Console.WriteLine($"** AggregatorGrain AddAnEvent() for event id {eventid}");

            // check args

            if (eventid == "")
                return;  // nothing to do
            // int index = pricePublicList.FindIndex(item => item.Size == 200);
            // if (State.eventids.Contains(eventid))
            int index = State.allevents.FindIndex(x => x.id == eventid);
            if(index >= 0)
                return;  // won't add same id twice

            // add this event key to our active list and persist it

            State.eventids.Add(eventid);
            Console.WriteLine($"** AggregatorGrain AddAnEvent() about to write WriteStateAsync for new event id {eventid}");
            await base.WriteStateAsync(); 

            return; 
        }


        // delete specific event from the aggregator event list
        public async Task DeleteAnEvent(string eventid)
        {
            Console.WriteLine($"** AggregatorGrain DeleteAnEvent() for event id {eventid}");

            // check args

            if (eventid == "")
                return;  // nothing to do
            if (! State.eventids.Contains(eventid))
                return;  // nothing to delete

            // delete this event key from our active list and persist it

            State.eventids.Remove(eventid);
            Console.WriteLine($"** Aggregator Grain DeleteAnEvent() about to write WriteStateAsync for deleted event id {eventid}");
            await base.WriteStateAsync(); 

            return;
        }


        // return filtered list of events
        // filter = ""|active|future|past
        public async Task<EventAPI> ListEvents(string filter)
        {
            foreach (string id in State.eventids)
            {
                // check if event matches filter
                
                Boolean add = false;
                if (filter == "") 
                {  
                    add = true;
                }
                else if (filter == "active")
                {

                }
                else if (filter == "future")
                {

                }
                else if (filter == "past")
                {

                }
                else
                    add = false;
                
            }

        }
    } 
}