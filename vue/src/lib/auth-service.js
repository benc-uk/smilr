//
// Taken from https://github.com/sunilbandla/vue-msal-sample
// Completely rewritten for MSAL v1.0.0 
// https://github.com/AzureAD/microsoft-authentication-library-for-js/wiki/MSAL.js-1.0.0-api-release

import * as Msal from 'msal'
/* eslint-disable */

export default class AuthService {

  constructor(appClientId, redirectPath) {
    let redirectUri = window.location.origin + redirectPath

    // Configuration object constructed
    this.applicationConfig = {
      auth: {
        clientId: appClientId,
        redirectUri: redirectUri,
      }
      // cache: {
      //   cacheLocation: "localStorage",
      //   storeAuthStateInCookie: true
      // }
    }

    // create UserAgentApplication instance
    this.app = new Msal.UserAgentApplication(this.applicationConfig);

    // register redirect call backs for Success and Error
    this.app.handleRedirectCallback(function(e, r) {
      console.log('authCallback', e, r);
    });
  }

  login() {
    let loginRequest = {
      scopes: ["user.read"]
    }
    
    let accessTokenRequest = {
      scopes: ["user.read"]
    }

    return this.app.loginPopup(loginRequest).then(function (loginResponse) { 
      this.app.acquireTokenSilent(accessTokenRequest).then(atr => { console.log(atr) })
      .catch(err => { console.log(err);
      })
      console.log("loginResponse")
      console.log(loginResponse)
      console.log("acct")
      let a = this.app.getAccount()
      console.log(a);
    })

    // return this.app.loginPopup(loginRequest).then(
    //   idToken => {
    //     const user = this.app.getUser()
    //     const account = myMSALObj.getAccount();
    //     console.log(idToken, account);
        
    //     if (account) {
    //       return { idToken: idToken, user: account }
    //     } else {
    //       return null
    //     }
    //   },
    //   () => {
    //     console.log("wwwwwwwwwwwwwwwwwww");
    //     return null
    //   }
    //)
  }

  logout() {
    this.app.logout()
  }

  getToken() {
    return this.app.acquireTokenSilent(this.applicationConfig.graphScopes).then(
      accessToken => {
        return accessToken
      },
      error => {
        return this.app
          .acquireTokenPopup(this.applicationConfig.graphScopes)
          .then(
            accessToken => {
              return accessToken
            },
            error => {
              console.error(error)
            }
          )
      }
    )
  }
}