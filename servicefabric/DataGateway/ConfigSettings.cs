using System.Fabric;
using System.Fabric.Description;

namespace DataGateway
{
  public class ConfigSettings
  {
    public string StatefulEventServiceName { get; private set; }
    public string StatefulFeedbackServiceName { get; private set; }
    public string ReverseProxyPort { get; private set; }

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
      ConfigurationSection section = settings.Sections["SmilrConfigSection"];
      this.StatefulEventServiceName = section.Parameters["StatefulEventServiceName"].Value;
      this.StatefulFeedbackServiceName = section.Parameters["StatefulFeedbackServiceName"].Value;
      this.ReverseProxyPort = section.Parameters["ReverseProxyPort"].Value;
    }
  }
}
