package main

//
// Implementation of Smilr in Go, frontend service routes
// Ben Coleman, July 2019, v1
//

import (
  "encoding/json"
  "net/http"
  "strings"
  
  "github.com/gorilla/mux"
  "github.com/benc-uk/go-starter/pkg/envhelper"
)

//
// MICRO API allowing dynamic configuration of the client side Vue.js
// Allow caller to fetch a comma separated set of environmental vars from the server
//
func routeConfig(resp http.ResponseWriter, req *http.Request) {
	data := make(map[string]string)

	varList := mux.Vars(req)["vars"]
	for _, key := range strings.Split(varList, ",") {
		data[key] = envhelper.GetEnvString(key, "")
	}

  json, _ := json.Marshal(data)
  
	resp.Header().Add("Content-Type", "application/json")
	resp.Write(json)
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

