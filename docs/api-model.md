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
  _id:    string    // Six character UID string
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
  _id:      string  // Twelve character UID string
  event:    string  // Event id
  topic:    number  // Topic id
  rating:   number  // Feedback rating 1 to 5
  comment:  string  // Feedback comments
}
``` 

## Notes
For certain historical reasons we do not use MongoDB auto generated ids (i.e. ObjectId) as they cause upstream problems with things such as Azure Functions. An early design goal for the project was "short code" URLs for events

Instead we generate our own string ids using the simple function below. Length 5 is used for events and length 12 for feedback. 

Although uniqueness is not guaranteed, the probability of clashes is small enough to be acceptable

```js
  makeId(len) {
    var text = "";
    var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";

    for (var i = 0; i < len; i++)
      text += possible.charAt(Math.floor(Math.random() * possible.length));

    return text;
  }
```

Also note, when using the mock API, the values of _id will be integers not UID strings, however it has no effect on functionality or the Vue.js client
