using System;
using GrainInterfaces;
using GrainModels;
using Orleans;
using System.Collections.Generic;
using System.Threading.Tasks;
using Orleans.Providers;


namespace Grains
{
  
    // The aggragtor grain maintains a list of all valid events, for mutlipe event queries
    // For a technology demonstrator, a single grain with a List of events is fine, but a real world isystem may choose to have multiple 
    // aggregators, one per silo and roll them up - https://dotnet.github.io/orleans/Documentation/frequently_asked_questions.html

    [StorageProvider(ProviderName = "grain-store")]  
    public class AggregatorGrain : Grain<AggregatorGrainState>, IAggregatorGrain
    {
        // add event id to event list
        public async Task AddAnEvent(string eventid)
        {
            Console.WriteLine($"** AggregatorGrain AddAnEvent() for event id {eventid}");

            if (eventid == "")
                return;  // nothing to do
            if (State.eventids.Contains(eventid))
                return;  // won't add same id twice

            // add this event key to our active list

            State.eventids.Add(eventid);
            Console.WriteLine($"** AggregatorGrain AddAnEvent() about to write WriteStateAsync for new event id {eventid}");
            await base.WriteStateAsync(); 

            return; 
        }

        // delete specific eventid from event list
        public async Task DeleteAnEvent(string eventid)
        {
            Console.WriteLine($"** AggregatorGrain DeleteAnEvent() for event id {eventid}");

            if (eventid == "")
                return;  // nothing to do
            if (! State.eventids.Contains(eventid))
                return;  // nothing to delete

            // delete this event key from our active list

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