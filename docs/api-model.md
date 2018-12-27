# API Reference
The API is RESTful and very simple, there are two main entities that can be referenced **event(s)** and **feedback** The standard REST verbs and conventions apply

**Events:**  
- `GET /api/events` - Return a list of all events
- `GET /api/events/filter/{active|future|past}` - Return list of events filtered to a given time frame
- `GET /api/event/{id}` - Return just one event, by id
- `POST /api/events` - Create a new event (*secured admin API call*)
- `PUT /api/events/{id}` - Update existing event (*secured admin API call*)
- `DELETE /api/events/{id}` - Delete event (*secured admin API call*)

**Feedback:**  
- `GET /api/feedback/{eventid}/{topicid}` - Return all feedback for given event and topic
- `POST /api/feedback` - Submit feedback

**Other routes:**  
- `GET /api/info` - Provide some information about the backend service, including hostname (good for debugging & checking loadbalancing)

## Swagger / OpenAPI
There is a full [Swagger definition for the API](../node/data-api/swagger.json) 
The data API server will also expose this out using Swagger UI, just use `/api-docs` as the URL, e.g.  **http://localhost:4000/api-docs/**

---

# Data Model
There are two main models, one for holding an **Event** and one for submitted **Feedback**, there are also **Topics** which only exist as simple objects nested inside **Events**. **Topics** as entities only exist logically client side, from the perspective of the API and database, there are only **Events** & **Feedback**, this means events are always stored & retrieved with a simple serialized JSON array of topics within them

```ts
Event {
  id:     any       // Six character UID string or int
  title:  string    // Title of the event, 50 char max
  type:   string    // Type of event ['event', 'workshop', 'hack', 'lab']
  start:  Date      // Start date, an ISO 8601 string; YYYY-MM-DD
  end:    Date      // End date, an ISO 8601 string; YYYY-MM-DD
  topics: Topic[];  // List of Topics, must be at least one
}
``` 
```ts
Topic {
  id:       number       // int (starting at 1)
  desc:     string       // Short description 
  feedback: Feedback[];  // VIRTUAL PROPERTY - Only hydrated client side when reporting
}
``` 
```ts
Feedback {
  id:       number  // Six character UID string or int
  event:    string  // Event id
  topic:    number  // Topic id
  rating:   number  // Feedback rating 1 to 5
  comment:  string  // Feedback comments
}
``` 
