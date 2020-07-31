package utils

import (
	"fmt"
	"net/http"
	"log"
	"encoding/json"
	"runtime"
	"math/rand"
	"time"
)

// SendError yes
func SendError(resp http.ResponseWriter, code int, msg, title string) {
	type details struct {
		Error bool `json:"error"`
		Title string `json:"title"`
		Details string `json:"details"`
		Status int `json:"status"`
		Source string `json:"source"`
	}

	_, file, line, ok := runtime.Caller(1)
	if !ok {
		line = 0
		file = "source_not_available"
	}

	det := details{
		Error: true,
		Title: title,
		Details: msg,
		Status: code,
		Source: fmt.Sprintf("%v:%v", file, line),
	}

	log.Printf("### Error! (%v) %v", title, msg)

	json, err := json.Marshal(det)
  if err != nil {
    http.Error(resp, "There was an error with SendError, which is just too much error. Bye", http.StatusInternalServerError)
	}
	
	resp.WriteHeader(code)
	resp.Write(json)
}

// SendData yes
func SendData(resp http.ResponseWriter, data interface{}) {
	json, err := json.Marshal(data)
	if err != nil {
		SendError(resp, 500, "Failed to marshal JSON: " + err.Error(), "send-data")
		return
	}

	resp.Write(json)
}

//
// MakeId is a simple random ID generator, good enough, with len=6 it's a 1:56 billion chance of a clash
//
func MakeID(length int) string {
	var text = ""
	var possible = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789"

	rand.Seed(time.Now().UnixNano())

	for i := 0; i < length; i++ {
		text += string(possible[rand.Intn(len(possible))])
	}

	return text
}