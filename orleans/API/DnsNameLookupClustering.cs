using Microsoft.Extensions.DependencyInjection;
using Microsoft.Extensions.Options;
using Orleans;
using Orleans.Configuration;
using Orleans.Messaging;
using Orleans.Runtime;
using System;
using System.Collections.Generic;
using System.Linq;
using System.Net;
using System.Threading.Tasks;

namespace API
{
    public static class ClientBuilderExtension
    {
        /// <summary>
        /// Configures the client to use dns name lookup clustering.
        /// </summary>
        /// <param name="builder"></param>
        /// <param name="dnsName">The gateway destination dns name.</param>
        /// <param name="port">The gateway port.</param>
        public static IClientBuilder UseDnsNameLookupClustering(this IClientBuilder builder, string dnsName, int port)
        {
            return builder.UseDnsNameLookupClustering(options =>
            {
                options.DnsName = dnsName;
                options.Port = port;
            });
        }

        /// <summary>
        /// Configures the client to use dns name lookup clustering.
        /// </summary>
        public static IClientBuilder UseDnsNameLookupClustering(this IClientBuilder builder, Action<DnsNameGatewayListProviderOptions> configureOptions)
        {
            return builder.ConfigureServices(
                collection =>
                {
                    if (configureOptions != null)
                    {
                        collection.Configure(configureOptions);
                    }

                    collection.AddSingleton<IGatewayListProvider, DnsNameGatewayListProvider>()
                        .ConfigureFormatter<DnsNameGatewayListProviderOptions>();
                });
        }

        /// <summary>
        /// Configures the client to use dns name lookup clustering.
        /// </summary>
        public static IClientBuilder UseDnsNameLookupClustering(this IClientBuilder builder, Action<OptionsBuilder<DnsNameGatewayListProviderOptions>> configureOptions)
        {
            return builder.ConfigureServices(
                collection =>
                {
                    configureOptions?.Invoke(collection.AddOptions<DnsNameGatewayListProviderOptions>());
                    collection.AddSingleton<IGatewayListProvider, DnsNameGatewayListProvider>()
                        .ConfigureFormatter<DnsNameGatewayListProviderOptions>();
                });
        }

    }

    /// <summary>
    /// Options for Configure DnsNameGatewayListProviderOptions
    /// </summary>
    public class DnsNameGatewayListProviderOptions
    {
        /// <summary>
        /// Dns name to use
        /// </summary>
        public string DnsName { get; set; }

        /// <summary>
        /// Port to use
        /// </summary>
        public int Port { get; set; }
    }

    /// <summary>
    /// This Gateway list provider looks up ip addresses based on a dns
    /// name.  This is ideal for container environments (kubernetes, swarm)
    /// as well as Service Fabric using the dns feature.
    /// </summary>
    public class DnsNameGatewayListProvider : IGatewayListProvider
    {
        private readonly DnsNameGatewayListProviderOptions options;
        private readonly TimeSpan maxStaleness;

        public DnsNameGatewayListProvider(IOptions<DnsNameGatewayListProviderOptions> options, IOptions<GatewayOptions> gatewayOptions)
        {
            this.options = options.Value;
            this.maxStaleness = gatewayOptions.Value.GatewayListRefreshPeriod;
        }

        #region Implementation of IGatewayListProvider

        public Task InitializeGatewayListProvider() => Task.CompletedTask;


        public Task<IList<Uri>> GetGateways()
        {
            var endpointUris = Dns.GetHostEntry(this.options.DnsName)
                                            .AddressList
                                            .Select(a => new IPEndPoint(a, this.options.Port).ToGatewayUri())
                                            .ToList();

            return Task.FromResult<IList<Uri>>(endpointUris);
        }

        public TimeSpan MaxStaleness
        {
            get => this.maxStaleness;
        }

        public bool IsUpdatable
        {
            get => true;
        }

        #endregion
    }
}