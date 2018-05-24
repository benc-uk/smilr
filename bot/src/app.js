//
// Smilr bot, using Bot Framework & Bot Builder SDK 3.x
// Ben Coleman, 2018
//

require('dotenv').config()

const restify = require('restify');
const builder = require('botbuilder');
const botbuilderAzure = require("botbuilder-azure");
const numConverter = require('number-to-words');

const utils = require('./utils');
const SmilrApi = require('./smilr-api');
const api = new SmilrApi(process.env.API_ENDPOINT || 'http://localhost:4000/api');

const luisAppId = process.env.LuisAppId;
const luisAPIKey = process.env.LuisAPIKey;
const luisAPIHostName = process.env.LuisAPIHostName || 'westus.api.cognitive.microsoft.com';
const LuisModelUrl = 'https://' + luisAPIHostName + '/luis/v2.0/apps/' + luisAppId + '?subscription-key=' + luisAPIKey;

// Setup Restify Server
const server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`### ${server.name} listening at: ${server.url}`);
});

// Create chat connector for communicating with the Bot Framework Service
console.log(`### App ID: ${process.env.MicrosoftAppId}`);
const connector = new builder.ChatConnector({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword,
  openIdMetadata: process.env.BotOpenIdMetadata
});

// Listen for messages from users 
server.post('/api/messages', connector.listen());

// Create your bot with a function to receive messages from the user
var bot = new builder.UniversalBot(connector, function (session, args) {
  session.send("I'm sorry I didn't understand, that.\nI'm not smart, I'm only made of code 😞", session.message.text);
  //session.beginDialog('HelpDialog');
});

var inMemoryStorage = new builder.MemoryBotStorage();
bot.set('storage', inMemoryStorage);
bot.set('persistConversationData', true);

// Create a recognizer that gets intents from LUIS, and add it to the bot
var recognizer = new builder.LuisRecognizer(LuisModelUrl);
bot.recognizer(recognizer);

// Send welcome when conversation with bot is started, by initiating the GreetingDialog 
bot.on('conversationUpdate', function (message) {
  if (message.membersAdded) {
    message.membersAdded.forEach(function (identity) {
      if (identity.id === message.address.bot.id) {
        bot.beginDialog(message.address, 'ActiveEventsDialog');//'GreetingDialog');
      }
    });
  }
});

// Add a dialog for each intent that the LUIS app recognizes
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
    await api.getEvents('active')
      .then(eventsResp => {
         // Store events in the session conversationData for use by later dialogs
         session.conversationData.events = JSON.parse(eventsResp);
      })
      .catch(err => {
        console.error(`### ${err.message}`);
        session.endDialog(`Sorry there was a technical problem getting event information 😢`);
      })
      
    // Response is based on on number of events 
    if (session.conversationData.events.length < 1) {
      session.endDialog(`Sorry there are no events running today`);
    } else if (session.conversationData.events.length == 1) {
      session.send(`There is one event on today, "${session.conversationData.events[0].title}"`);
      builder.Prompts.confirm(session, "Would you like to give feedback on it?")
    } else {
      session.endDialog();
      session.beginDialog('MultiEventsDialog');
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
  matches: 'events-active',
  intentThreshold: 0.50
})


bot.dialog('MultiEventsDialog', [
  (session) => {
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
    .text(`Please provide your rating for: ${event.title}: ${event.topics[fid].desc}`)
    .images([
      builder.CardImage.create(session, utils.getImageSVG('faces.svg'))
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
    .images([
      builder.CardImage.create(session, utils.getImageSVG(event.type + '.svg'))
    ])
    .buttons(topicButtons);
}