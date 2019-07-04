package main

//
// Implementation of Smilr in Go, data-api service
// Ben Coleman, July 2019, v1
//

import (
  "fmt"
  "net/http"
  "log"
  "os"
  "strings"

  "github.com/benc-uk/go-starter/pkg/envhelper"
  "github.com/benc-uk/smilr/data-api/dal"

  "github.com/gorilla/mux"
  _ "github.com/joho/godotenv/autoload" // Autoloads .env file if it exists
)

var (
  healthy   = true                // Simple health flag
  version   = "4.7.0"             // App version number, set at build time with -ldflags "-X main.version=1.2.3"
  buildInfo = "No build details"  // Build details, set at build time with -ldflags "-X main.buildInfo='Foo bar'"
)

//
// Main entry point, will start HTTP service
//
func main() {
  log.SetOutput(os.Stdout) // Personal preference on log output 
  log.Printf("### Smilr data-api server [Golang] v%v starting...", version)

  // Port to listen on, change the default as you see fit
  serverPort := envhelper.GetEnvInt("PORT", 4000)  
  mongoURL := envhelper.GetEnvString("MONGO_CONNSTR", "mongodb://localhost:27017")
  mongoRetries := envhelper.GetEnvInt("MONGO_RETRIES", 6)
  mongoRetryDelay := envhelper.GetEnvInt("MONGO_RETRY_DELAY", 10)

  // Use gorilla/mux for routing  
  router := mux.NewRouter()     
  // Add middleware for logging and CORS
  router.Use(starterMiddleware) 

  // Application routes here
  router.HandleFunc("/healthz", routeHealthCheck)
  router.HandleFunc("/api/info", routeStatus)
  router.HandleFunc("/api/events", routeEventsGetAll).Methods("GET")
  router.HandleFunc("/api/events/{id}", routeEventsGetSingle).Methods("GET")
  router.HandleFunc("/api/events/filter/{filter}", routeEventsGetFiltered).Methods("GET")
  router.HandleFunc("/api/events", routeEventsPost).Methods("POST")
  router.HandleFunc("/api/events/{id}", routeEventsPut).Methods("PUT")
  router.HandleFunc("/api/events/{id}", routeEventsDelete).Methods("DELETE")
   
  // Connect to database with retries
  err := dal.Connect(mongoURL, "smilrDb", mongoRetryDelay, mongoRetries)
  if err != nil {
    log.Printf("### Unable to connect to MongoDB, terminating now")
		panic(err.Error())
  } 

  // Start server
  log.Printf("### Server listening on %v\n", serverPort)
  err = http.ListenAndServe(fmt.Sprintf(":%d", serverPort), router)
  if err != nil {
		panic(err.Error())
  } 
}

//
// Log all HTTP requests with client address, method and request URI
// Plus a cheap and dirty CORS enabler
//
func starterMiddleware(next http.Handler) http.Handler {
  return http.HandlerFunc(func(resp http.ResponseWriter, req *http.Request) {
    resp.Header().Set("Access-Control-Allow-Origin", "*")
    resp.Header().Add("Content-Type", "application/json")
    
    log.Println("###", strings.Split(req.RemoteAddr, ":")[0], req.Method, req.RequestURI)
    next.ServeHTTP(resp, req)
  })
}