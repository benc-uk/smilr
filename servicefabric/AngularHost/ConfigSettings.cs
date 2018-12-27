using System;
using System.Collections.Generic;
using System.Fabric;
using System.Fabric.Description;
using System.Linq;
using System.Threading.Tasks;

namespace AngularHost
{
  public class ConfigSettings
  {
    public string API_ENDPOINT { get; private set; }

    public ConfigSettings(StatelessServiceContext serviceContext)
    {
      serviceContext.CodePackageActivationContext.ConfigurationPackageModifiedEvent += this.CodePackageActivationContext_ConfigurationPackageModifiedEvent;

      this.UpdateConfigSettings(serviceContext.CodePackageActivationContext.GetConfigurationPackageObject("Config").Settings);
    }

    private void CodePackageActivationContext_ConfigurationPackageModifiedEvent(object sender, PackageModifiedEventArgs<ConfigurationPackage> e)
    {
      this.UpdateConfigSettings(e.NewPackage.Settings);
    }

    private void UpdateConfigSettings(ConfigurationSettings settings)
    {
      ConfigurationSection section = settings.Sections["AngularHostConfigSection"];
      this.API_ENDPOINT = section.Parameters["API_ENDPOINT"].Value;
    }
  }
}
