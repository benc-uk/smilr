package dal

import (
	"log"
	"context"
	"time"
	"errors"

	"github.com/benc-uk/smilr/data-api/utils"

	"go.mongodb.org/mongo-driver/bson"
	"go.mongodb.org/mongo-driver/mongo"
  "go.mongodb.org/mongo-driver/mongo/options"
	"go.mongodb.org/mongo-driver/mongo/readpref"
)


const eventCollection = "events"
const feedbackCollection = "feedback"
const timeout = 3

var	client *mongo.Client
var	db *mongo.Database

//
// Connect global thingy
//
func Connect(mongoURL, dbName string, retryDelay, retries int) error {
	var err error

	if client != nil { return nil }

	for retry := 0; retry < retries; retry++ {
		log.Printf("### Attempt %v to connect to %v", retry  + 1, mongoURL)
		ctx, cancel := context.WithTimeout(context.Background(), time.Duration(retryDelay) * time.Second)
		defer cancel()
		client, err = mongo.Connect(ctx, options.Client().ApplyURI(mongoURL))
		if err != nil { break }
		err = client.Ping(ctx, readpref.Primary())
		if err == nil { break }
	}
	
	if err != nil { 
		return err
	}

	db = client.Database(dbName)
	return nil
}

//
// QueryEvents is a function
//
func QueryEvents(filter string) ([]bson.M, error) {
	var query *bson.M
	today := time.Now().Format(time.RFC3339)

	switch filter {
	case "all":
		query = &bson.M{}
	case "past":
		query = &bson.M{ "end": bson.M{"$lt": today}}
	case "future":
		query = &bson.M{ "start": bson.M{"$gt": today}}
	case "active":
		query = &bson.M{"$and": []bson.M{
			{"start": bson.M{"$lte": today}}, 
			{"end": bson.M{"$gte": today}},
		}}
	default:
		err := errors.New("filter '"+filter+"' is not accepted, must be one of: [all, active, future, past]")
		return nil, err
	}

	ctx, cancel := context.WithTimeout(context.Background(), timeout * time.Second)
	defer cancel()
	cur, err := db.Collection(eventCollection).Find(ctx, query)
	if err != nil {
		return nil, err
	}
	events, err := cursorToArray(ctx, cur)

	return events, err
}

//
// GetEvent - yes
//
func GetEvent(id string) (bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout * time.Second)
	defer cancel()
	
	var event bson.M
	filter := bson.M{ "_id": id }
	err := db.Collection(eventCollection).FindOne(ctx, filter).Decode(&event)
	if err != nil {
		return nil, err
	}

	return event, err
}

//
// CreateEvent - yes
//
func CreateEvent(event []byte) (bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout * time.Second)
	defer cancel()	

	var eventObj bson.M
	err := bson.UnmarshalExtJSON(event, true, &eventObj)
	if err != nil {
		return nil, err
	}

	// Create a random short-code style id for new events
	// IMPORTANT!
	// We have to create our own id as a string, because Azure Functions can't handle MongoDB self generated ids
	id := utils.MakeID(5)
	eventObj["_id"] = id
	
	_, err = db.Collection(eventCollection).InsertOne(ctx, eventObj)
	if err != nil {
		return nil, err
	}

	return eventObj, nil
}

//
// CreateEvent - yes
//
func UpdateEvent(event []byte, id string) (bson.M, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout * time.Second)
	defer cancel()	

	var eventObj bson.M
	err := bson.UnmarshalExtJSON(event, true, &eventObj)
	if err != nil {
		return nil, err
	}
	
	filter := &bson.M{ "_id": eventObj["_id"] } 
	update := &bson.M{ "$set": eventObj }

	_, err = db.Collection(eventCollection).UpdateOne(ctx, filter, update)
	if err != nil {
		return nil, err
	}

	eventObj["_id"] = id;
	return eventObj, nil
}

//
// DeleteEvent - yes
//
func DeleteEvent(id, eventType string) (bool, error) {
	ctx, cancel := context.WithTimeout(context.Background(), timeout * time.Second)
	defer cancel()	
	
	filter := &bson.M{ "_id": id, "type": eventType }

	_, err := db.Collection(eventCollection).DeleteOne(ctx, filter)
	if err != nil {
		return false, err
	}

	return true, nil
}

//
//
//
func cursorToArray(ctx context.Context, cur *mongo.Cursor) ([]bson.M, error) {
	var docs []bson.M

	for cur.Next(ctx) {
		var doc bson.M
		err := cur.Decode(&doc)
		if err != nil {
			return nil, err
		}
		docs = append(docs, doc)
	}

	return docs, nil
}