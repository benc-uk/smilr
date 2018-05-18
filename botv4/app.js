//
// Smilr Bot
// Ben Coleman, 2018
//

require('dotenv').config()

const { BotStateSet, BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const { MessageFactory, CardFactory } = require('botbuilder');
const { LuisRecognizer } = require('botbuilder-ai');

const restify = require('restify');

// Create server
let server = restify.createServer();
server.listen(process.env.port || process.env.PORT || 3978, function () {
  console.log(`${server.name} listening to ${server.url}`);
});

const luisModel = new LuisRecognizer({
  appId: process.env.LuisAppId,
  subscriptionKey: process.env.LuisSubKey,
  serviceEndpoint: `https://${process.env.LuisRegion}.api.cognitive.microsoft.com`
});

// Create adapter
const adapter = new BotFrameworkAdapter({
  appId: process.env.MicrosoftAppId,
  appPassword: process.env.MicrosoftAppPassword
});

// Add state middleware
const storage = new MemoryStorage();
const convoState = new ConversationState(storage);
const userState = new UserState(storage);
adapter.use(new BotStateSet(convoState, userState));
adapter.use(luisModel);

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
  // Route received request to adapter for processing
  adapter.processActivity(req, res, async (context) => {
    if (context.activity.type === 'message') {
      //const state = convoState.get(context);
      //const count = state.count === undefined ? state.count = 0 : ++state.count;
      const luisResults = luisModel.get(context);
      let intent = await LuisRecognizer.topIntent(luisResults);

      sendWelcome(context);
      //await context.sendActivity(`Your intent is ${intent}`);
    } else {
      return context.sendActivity(`[${context.activity.type} event detected]`);
    }
  });
});

//
//
//
function sendWelcome(context) {
  context.sendActivity(`Hi I'm Smilr bot, I can help you send feedback for events that are running`);
}