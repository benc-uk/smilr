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
        // initialise a grain with the info needed to set up an actual event
        Task Update(string title, string type, string start, string end, TopicAPI[] topics);

        // return event info 
        Task<EventAPI> Info();

    }
}
