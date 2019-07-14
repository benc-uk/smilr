package main

//
// Implementation of Smilr in Go, data-api routes
// Ben Coleman, July 2019, v1
//

import (
  "encoding/json"
  "net/http"
  "os"
  "runtime"
  "io/ioutil"
  "fmt"

  "github.com/benc-uk/smilr/data-api/dal"
  "github.com/benc-uk/smilr/data-api/utils"

  "github.com/gorilla/mux"
)

//
//
//
func routeEventsGetAll(resp http.ResponseWriter, req *http.Request) {
  events, err := dal.QueryEvents("all")
  if err != nil {
    utils.SendError(resp, 500, "Failed to get events: "+ err.Error(), "event-get")
    return
  }

  utils.SendData(resp, events)
}

//
//
//
func routeEventsGetSingle(resp http.ResponseWriter, req *http.Request) {
  id := mux.Vars(req)["id"]

  event, err := dal.GetEvent(id)
  if err != nil { 
    utils.SendError(resp, 404, "Event with id '"+id+"' not found", "event-get")
    return
  }
  
  utils.SendData(resp, event)
}


//
//
//
func routeEventsGetFiltered(resp http.ResponseWriter, req *http.Request) {
  filter := mux.Vars(req)["filter"]

  events, err := dal.QueryEvents(filter)
  if err != nil {
    utils.SendError(resp, 500, "Failed to get events: "+ err.Error(), "event-get")
    return
  }

  utils.SendData(resp, events)
}

//
//
//
func routeEventsPost(resp http.ResponseWriter, req *http.Request) {
  body, err := ioutil.ReadAll(req.Body)
  if err != nil {
    utils.SendError(resp, 500, "Failed to create event: "+ err.Error(), "event-create")
    return
  }

  newEvent, err := dal.CreateEvent(body)
  if err != nil {
    utils.SendError(resp, 500, "Failed to create event: "+ err.Error(), "event-create")
    return
  }

  utils.SendData(resp, newEvent)
}

//
//
//
func routeEventsPut(resp http.ResponseWriter, req *http.Request) {
  body, err := ioutil.ReadAll(req.Body)
  if err != nil {
    utils.SendError(resp, 500, "Failed to update event: "+ err.Error(), "event-update")
    return
  }

  updatedEvent, err := dal.UpdateEvent(body, mux.Vars(req)["id"])
  if err != nil {
    utils.SendError(resp, 500, "Failed to update event: "+ err.Error(), "event-update")
    return
  }

  utils.SendData(resp, updatedEvent)
}

//
//
//
func routeEventsDelete(resp http.ResponseWriter, req *http.Request) {
  id := mux.Vars(req)["id"]
  event, err := dal.GetEvent(id)
  if err != nil {
    utils.SendError(resp, 404, "Failed to delete event: "+ err.Error(), "event-delete")
    return
  }

  _, err = dal.DeleteEvent(id, fmt.Sprintf("%v", event["type"]))
  if err != nil {
    utils.SendError(resp, 500, "Failed to update event: "+ err.Error(), "event-delete")
    return
  }

  type msg struct{ Message string `json:"message"`}
  respMsg := &msg{Message: "Deleted event '"+id+"' ok"}
  fmt.Println(respMsg)

  utils.SendData(resp, respMsg)
}

//
// Simple health check endpoint, returns 204 when healthy
//
func routeHealthCheck(resp http.ResponseWriter, req *http.Request) {
  if healthy {
    resp.WriteHeader(http.StatusNoContent)
    return
  }
  resp.WriteHeader(http.StatusServiceUnavailable)
}

//
// Return status information data - Remove if you like
//
func routeStatus(resp http.ResponseWriter, req *http.Request) {
  type status struct {
    Healthy    bool   `json:"healthy"`
    Version    string `json:"version"`
    BuildInfo  string `json:"buildInfo"`
    Hostname   string `json:"hostname"`
    OS         string `json:"os"`
    Arch       string `json:"architecture"`
    CPU        int    `json:"cpuCount"`
    GoVersion  string `json:"goVersion"`
    ClientAddr string `json:"clientAddress"`
    ServerHost string `json:"serverHost"`
  }

  hostname, err := os.Hostname()
  if err != nil {
    hostname = "hostname not available"
  }

  currentStatus := status{
    Healthy:    healthy,
    Version:    version,
    BuildInfo:  buildInfo,
    Hostname:   hostname,
    GoVersion:  runtime.Version(),
    OS:         runtime.GOOS,
    Arch:       runtime.GOARCH,
    CPU:        runtime.NumCPU(),
    ClientAddr: req.RemoteAddr,
    ServerHost: req.Host,
  }

  statusJSON, err := json.Marshal(currentStatus)
  if err != nil {
    http.Error(resp, "Failed to get status", http.StatusInternalServerError)
  }

  resp.Header().Add("Content-Type", "application/json")
  resp.Write(statusJSON)
}
