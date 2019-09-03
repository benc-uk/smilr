import http from "k6/http";
import { check } from "k6";
import { group } from "k6";

//
// Options, stages and thresholds for load test here
//
export let options = { 
  maxRedirects: 4,
  stages: [
    { duration: "30s", target: 10 },
    { duration: "30s", target: 20 },
    { duration: "30s", target: 50 },
    { duration: "30s", target: 100 },
    { duration: "30s", target: 0 },
  ],
  thresholds: {
    "failed requests":   [ "rate < 0.1" ], 
    "http_req_duration": [ "p(90) < 650" ]
  }
};

// Environmental input parameters
const API_HOST = __ENV.API_HOST || `http://localhost:4000`
const FRONT_HOST = __ENV.FRONT_HOST || `http://localhost:3000`

// Globals
var newEventId = ""

export function setup() {
  console.log(`Data API host tested is: ${API_HOST}`)
  console.log(`Frontend host tested is: ${FRONT_HOST}`)
}

export default function() {
  group("Frontend", function() {
    let url = `${FRONT_HOST}`;
    let res = http.get(url);
    check(res, {
      "GET /: status 200": (r) => r.status === 200,
      "GET /: page is loaded": (r) => r.body.length > 800
    });    
  });

  group("API Creates", function() {
    let url = `${API_HOST}/api/events`;
    let payload = JSON.stringify({
      "title": `Loadtesting data ${__VU}.${__ITER}`,
      "type": "event",
      "start": "2018-12-01",
      "end": "2020-12-29",
      "topics": [ {"id": 1, "desc": "Blah blah"}, {"id": 2, "desc": "Test data is boring"} ]
    });
    let res = http.post(url, payload, { headers: { "Content-Type": "application/json" } });
    check(res, {
      "POST /api/events: status 200": (r) => r.status === 200,
      "POST /api/events: resp event is valid": (r) => JSON.parse(r.body).type === "event",
      "POST /api/events: resp event has ID": (r) => typeof JSON.parse(r.body)._id === "string"
    });
    newEventId = JSON.parse(res.body)._id
  });

  group("API Reads", function() {
    let url = `${API_HOST}/api/events/${newEventId}`;
    let res = http.get(url);
    check(res, {
      "GET /api/events/{id}: status 200": (r) => r.status === 200,
      "GET /api/events/{id}: fetched event is ok": (r) => JSON.parse(r.body)._id === newEventId
    });    
  });

  group("API Updates", function() {
    let url = `${API_HOST}/api/events/${newEventId}`;
    let payload = JSON.stringify({
      "title": `Loadtesting data ${__VU}.${__ITER}`,
      "type": "event",
      "start": "2018-12-01",
      "end": "2025-12-29",
      "topics": [ {"id": 1, "desc": "Blah blah"}, {"id": 2, "desc": "Test data is boring"} ]
    });
    let res = http.put(url, payload, { headers: { "Content-Type": "application/json" } });
    check(res, {
      "PUT /api/events/{id}: status 200": (r) => r.status === 200,
      "PUT /api/events/{id}: updated date is ok": (r) => JSON.parse(r.body).end === "2025-12-29"
    });    
  });  

  group("API Deletes", function() {
    let url = `${API_HOST}/api/events/${newEventId}`;
    let res = http.request("DELETE", url);
    check(res, {
      "DELETE /api/events/{id}: status 200": (r) => r.status === 200,
      "DELETE /api/events/{id}: get deletion message": (r) => typeof JSON.parse(r.body).message === "string"
    });    
  }); 
};