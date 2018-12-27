namespace DataGateway.ViewModels
{
  public class Feedback
  {
    public string id { get; set; }
    public string @event { get; set; }
    public int topic { get; set; }
    public int rating { get; set; }
    public string comment { get; set; }
  }
}
