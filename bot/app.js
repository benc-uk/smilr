// Copyright (c) Microsoft Corporation. All rights reserved.
// Licensed under the MIT License.

require('dotenv').config()

const { BotStateSet, BotFrameworkAdapter, MemoryStorage, ConversationState, UserState } = require('botbuilder');
const restify = require('restify');

// Create server
let server = restify.createServer();
server.l
server.listen(process.env.port || process.env.PORT || 3978, function () {
    console.log(`${server.name} listening to ${server.url}`);
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

// Listen for incoming requests 
server.post('/api/messages', (req, res) => {
    // Route received request to adapter for processing
    adapter.processActivity(req, res, (context) => {
        if (context.activity.type === 'message') {
            const state = convoState.get(context);
            const count = state.count === undefined ? state.count = 0 : ++state.count;
            return context.sendActivity(`${count}: You are in a cave... "${context.activity.text}"`);
        } else {
            return context.sendActivity(`[${context.activity.type} event detected]`);
        }
    });
});