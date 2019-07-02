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
)

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
