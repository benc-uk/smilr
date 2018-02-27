using Orleans;
using System;
using System.Collections.Generic;
using System.Text;
using System.Threading.Tasks;

namespace GrainInterfaces
{
    public interface IEventGrain : IGrainWithStringKey
    {
        Task<string> GetTitle();

        Task SetTitle(string title);
    }
}
