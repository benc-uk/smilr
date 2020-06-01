//const session = require('express-session');
const passport = require('passport')
const BearerStrategy = require('passport-azure-ad').BearerStrategy

//
// This sets up all middleware and Passport gubbins
// For AAD v2 access token authentication and sign-in
// It's kept here to stop cluttering server.js with weirdness
//
module.exports = function(app) {
  console.log('### Setting up AAD bearer token validation middleware')

  app.use(passport.initialize())
  app.use(passport.session())

  const strategy = new BearerStrategy({
    identityMetadata: 'https://login.microsoftonline.com/common/v2.0/.well-known/openid-configuration',
    clientID: process.env.SECURE_CLIENT_ID,
    allowMultiAudiencesInToken: true,
    validateIssuer: false,
    loggingLevel: 'error',
  }, gotValidToken)

  passport.use(strategy)
}

function gotValidToken(token, done) {
  console.log(`### Protected API route called by: ${token.name} with scope: ${token.scp}`)

  // Check scopes are valid
  if (!token.scp.toLowerCase().includes('smilr.events')) {
    console.log('### ERROR! Token doesn\'t include \'smilr.events\' scope permissions')
    console.log(token)
    return done(null, false)
  }

  // Check audience is valid
  if (token.aud != process.env.SECURE_CLIENT_ID) {
    console.log('### ERROR! Token audience doesn\'t match app client id '+process.env.SECURE_CLIENT_ID)
    console.log(token)
    return done(null, false)
  }

  return done(null, token)
}

