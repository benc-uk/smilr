//
// Smilr bot, using Bot Framework & Builder SDK 3.x
// Ben Coleman, 2018
//

require('dotenv').config()

const restify = require('restify');
const builder = require('botbuilder');
const botbuilder_azure = require("botbuilder-azure");
//const request = require('request-promise-native');
const numConverter = require('number-to-words');

const utils = require('./utils');
const api = require('./smilr-api');

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log('%s listening to %s', server.name, server.url);
});

// Create chat connector for communicating with the Bot Framework Service
const connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  openIdMetadata: process.env.BotOpenIdMetadata
});


// Listen for messages from users 
server.post('/api/messages', connector.listen());

// var tableName = 'botdata';
// var azureTableClient = new botbuilder_azure.AzureTableClient(tableName, process.env['AzureWebJobsStorage']);
// var tableStorage = new botbuilder_azure.AzureBotStorage({ gzipData: false }, azureTableClient);
var inMemoryStorage = new builder.MemoryBotStorage();

// Create your bot with a function to receive messages from the user
// This default message handler is invoked if the user's utterance doesn't
// match any intents handled by other dialogs.
var bot = new builder.UniversalBot(connector, function (session, args) {
  session.send("I'm sorry I didn't understand, that.\nI'm not smart, I'm only made of code 😞", session.message.text);
  //session.beginDialog('HelpDialog');
});

bot.set('storage', inMemoryStorage);
bot.set('persistConversationData', true);

// Make sure you add code to validate these fields
var luisAppId = process.env.LuisAppId;
var luisAPIKey = process.env.LuisAPIKey;
var luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';

const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Add first run dialog
// DOES NOT WORK!
/*bot.dialog('firstRun', function (session) {    
  session.userData.firstRun = true;
  session.beginDialog('GreetingDialog')
}).triggerAction({
  onFindAction: function (context, callback) {
      // Only trigger if we've never seen user before
      if (!context.userData.firstRun) {
          // Return a score of 1.1 to ensure the first run dialog wins
          callback(null, 1.1);
      } else {
          callback(null, 0.0);
      }
  }
});*/

// Add a dialog for each intent that the LUIS app recognizes.
// See https://docs.microsoft.com/en-us/bot-framework/nodejs/bot-builder-nodejs-recognize-intent-luis 
bot.dialog('GreetingDialog',
  (session) => {
    let r = utils.getRandomInt(3);
    switch (r) {
      case 0: intro = "Hi! I'm Smilr,"; break;
      case 1: intro = "Hello, welcome to Smilr"; break;
      case 2: intro = "This is Smilr"; break;
    }
    session.send(`${intro}, I'm a bot for giving feedback on events, hacks and workshops you have attended`);
    session.endDialog();
  }
).triggerAction({
  matches: 'greeting'
})


bot.dialog('HelpDialog', [
  (session) => {
    let r = utils.getRandomInt(3);
    switch (r) {
      case 0: intro = "I think you could do with some help"; break;
      case 1: intro = "Maybe you need some help"; break;
      case 2: intro = "Sounds like you need a hand"; break;
    }

    session.send(`${intro}`);
    builder.Prompts.confirm(session, "Would you like to see today's events?");
  },
  (session, results) => {
    if (results.response) {
      session.beginDialog('ActiveEventsDialog');
    } else {
      session.endDialog("Ok, no problem");
    }
  }]
).triggerAction({
  matches: 'help'
})


bot.dialog('ActiveEventsDialog', [
  async (session) => {
    session.sendTyping();

    await utils.sleep(2000);

    // Call API get get active events 
    let events = [];
    await api.getEvents('active')
      .then(eventsResp => {
        events = JSON.parse(eventsResp);
      })
      .catch(err => {
        console.error(err.message);
        session.endDialog(`Sorry there was a technical problem getting event data 😢`);
      })
    session.conversationData.events = events;
    console.dir(session.conversationData.events)

    // Response is based on on number of events 
    if (events.length < 1) {
      session.endDialog(`Sorry there are no events running today`);
    } else if (events.length == 1) {
      session.send(`There is one event on today, "${events[0].title}"`);
      builder.Prompts.confirm(session, "Would you like to give feedback on it?")
    } else {
      session.endDialog();
      session.beginDialog('MultiEventsDialog');
      //session.endDialog(`There are ${numConverter.toWords(events.length)} events on today:\n`);
    }
  },
  (session, results) => {
    if (results.response) {
      session.beginDialog('SingleEventDialog');
    } else {
      session.endDialog("OK");
    }
  }]
).triggerAction({
  matches: 'events-active'
})


bot.dialog('MultiEventsDialog', [
  (session) => {
    console.dir(session.conversationData.events);
    session.endDialog(`There are multiple events on! ${JSON.stringify(session.conversationData.events)}`);
  }]
)

bot.dialog('SingleEventDialog', [
  (session) => {
    var msg = new builder.Message(session).addAttachment(createTopicCard(session, session.conversationData.events[0]));
    builder.Prompts.number(session, msg)
    //session.send(msg);
  },
  (session, result) => {
    var msg = new builder.Message(session).addAttachment(createFeedbackCard(session, session.conversationData.events[0], 0));
    session.send(msg);
  }]
)


bot.dialog('CancelDialog',
  (session) => {
    session.send(`OK, let's not do that`);
    session.endDialog();
  }
).triggerAction({
  matches: 'cancel',
  intentThreshold: 0.50
})

///
///
///
function createFeedbackCard(session, event, fid) {
  return new builder.HeroCard(session)
    .title(event.title)
    .subtitle(`Topic: ${event.topics[fid].desc}`)
    .text(`Please provide your rating for <b>${event.title}: ${event.topics[fid].desc}</b>`)
    .images([
      builder.CardImage.create(session, `https://smilr.azurewebsites.net/assets/img/events/${event.type}.svg`)
    ])
    .buttons([
      builder.CardAction.imBack(session, '1', 'Rating 😩 (1)'),
      builder.CardAction.imBack(session, '2', 'Rating 🙁 (2)'),
      builder.CardAction.imBack(session, '3', 'Rating 😐 (3)'),
      builder.CardAction.imBack(session, '4', 'Rating 🙂 (4)'),
      builder.CardAction.imBack(session, '5', 'Rating 😄 (5)')
    ]);
}

///
///
///
function createTopicCard(session, event) {
  let topicButtons = [];
  for(topic of event.topics) {
    topicButtons.push( builder.CardAction.imBack(session, `${topic.id}`, topic.desc) )
  }
  return new builder.HeroCard(session)
    .title(event.title)
    .text(`Please pick the topic you want to give feedback on`)
    .buttons(topicButtons);
}