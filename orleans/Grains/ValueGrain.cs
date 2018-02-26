using GrainInterfaces;
using Orleans;
using System;
using System.Threading.Tasks;

namespace Grains
{
    public class GrainState
    {
        public string value { get; set; } = "grain-not-set";
    }

    [Orleans.Providers.StorageProvider(ProviderName="grain-store")]
    public class ValueGrain : Grain<GrainState>, IValueGrain
    {
        // Moved to GrainState, for persistence
        // I have no idea what I'm doing...
        //private string value = "none";

        public Task<string> GetValue()
        {
            // Getting it from GrainState, is that bad? I don't think so unless I call base.ReadStateAsync();
            base.ReadStateAsync();
            return Task.FromResult( State.value );
        }

        public Task SetValue(string value)
        {
            State.value = value;
            base.WriteStateAsync();
            return Task.CompletedTask;
        }
    }
}
