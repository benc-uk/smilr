# Vue.js Client App
This is a [Vue.js v2 app](https://vuejs.org/) and has been created using [Vue CLI 3](https://cli.vuejs.org/) using the `vue create` command. The Vue project is written in plain ES6 JavaScript. 

The Webpack configuration is thankfully handled entirely by the Vue CLI, so there is no external Webpack config file. Babel was not enabled so no polyfilling will occur, therefore resulting app will only run on modern browsers. ESLint was enabled with the 'essential/recommended' configuration. The normal [Vue router](https://router.vuejs.org/) is used.

Node v8 was used and tested for the building and bundling, but this is not a Node app, Node is only used at build time.

> Note. The Vue.js CLI is not required to be installed as a global tool (i.e. the `vue` command) in order to build or serve the app

Main dependencies and libraries used:
- [Bootstrap Vue](https://bootstrap-vue.js.org/) - Main UI framework
- [Bootswatch Themes](https://bootswatch.com/) -  Cosmo theme used
- [Font Awesome](https://fontawesome.com/how-to-use/on-the-web/using-with/vuejs) - Icons
- [Axios](https://github.com/axios/axios) - HTTP client
- [JSON Server](https://github.com/typicode/json-server) - For mock API
- [MSAL.js](https://github.com/AzureAD/microsoft-authentication-library-for-js) - Azure AD v2 authentication
- [VeeValidate](https://baianat.github.io/vee-validate/) - Data validation

# Building & Running Locally
To work locally you will need Node.js v8.9+ installed and NPM (which typically is installed alongside Node). 

> :speech_balloon: Note. All commands here require that you are working from the project's `/vue` sub-directory

### Install Dependencies 
Run this first! Standard NPM install of project dependencies  
```
npm install
```

### Running Local Dev Server
This will start a test server on port 3000 and serve the app, this means you can run/test the client without needing the real frontend Node server. This server should only ever be used for local dev work. 

> :speech_balloon: **Important!** The app will still require a functioning API, and VUE_APP_API_ENDPOINT must be set. So you either need to start the mock API or to point to a real data-api service with the configuration (see below) 

```
npm run serve
```

### Compile & Bundle for Production
To build, bundle and minify the app using Webpack. The resulting output will be placed into the `dist` subdirectory (i.e. `/vue/dist` from main project root). This output is ready to be served via the Node frontend service. 

It's recommended to run `build-modern` which uses the [Vue CLI newer modern build mode](https://cli.vuejs.org/guide/browser-compatibility.html#modern-mode) outputting native ES6 modules. By design, no effort has been made in this app to support older browsers.
```
npm run build-modern
```


# Project Structure
Some notes on the overall structure of the `/vue` directory, and some key source files.

The project is a standard Vue CLI template project and has been split logically into a number of Vue components and also some Vue mixins, so you will find:

- `./src` - All source code
- `./src/main.js` - App entry point, all initialisation done here and mounting of **App** component
- `./src/App.vue` - Main top level **App** component, with router outlet and main page structure, navbar etc
- `./src/router.js` - Handles routing, and error and security checks

Other notable files/directories:

- `./src/components` - All Vue components as .vue files
- `./src/mixins` - Several helper Vue mixins
- `./src/mixins/api.js` - This mixin provides methods for calling the Smilr API 
- `./src/auth` - Helper classes used for AAD authentication
- `./public` - Static content and index.html
- `./mock-api` - Fake API server, see below


# Configuration
Configuration of any SPA can be tricky as they run entirely in the user's browser. For Smilr config is done either by [Vue CLI's environmental variable support](https://cli.vuejs.org/guide/mode-and-env.html) or a custom runtime configuration endpoint. Which is used is dependant which 'mode' the app is running in.  
The app stores all settings in a global dictionary object named `config` which is exported from `main.js` so as to be globally available. When the app starts it populates this `config` object as per the two modes described below

## Development Mode
This mode is only used when running `npm run serve`, i.e. local testing mode. In this mode the `.env.development` file is used for configuration and settings. This file is not provided with the repo, however a sample file `.env.development.sample` is included which should be copied & renamed. All settings require the `VUE_APP_` prefix or they will not be picked up, so `API_ENDPOINT` becomes `VUE_APP_API_ENDPOINT`

## Production Mode
This mode is used when the app is properly built and bundled using `npm run build`. In this mode the app will try to configure itself at startup using initialization code in `main.js`. This initialization process calls a special runtime config API of the Node frontend server, this API provides a simple mechanism for fetching environmental variables from the server. This allows us to reconfigure the app from the sever side, without "baking in" config at build time

This also means when running in production mode the app must be served from the dedicated Smilr Node frontend server, **serving from simple static file hosting (e.g. Azure Storage or other hosting) will not work**. It also means that configuration is done by setting env variables on the frontend server, much like you would with a classic server-side web app

## Config Variables Reference

| Variable Name | Description |
| ------------- | ----------- |
| API_ENDPOINT |**Required setting!** This points to URL endpoint of the data service API, e.g. `https://myapi.azurewebsites.net/api`. It must end with `/api` |
| AAD_CLIENT_ID | Optional. The client ID of an app registered in Azure AD, setting this to anything other than blank will "switch security on". Further details are provided in the [Security section below](#security). *Default: 'blank'* |

# Mock API
When running & testing locally it's often inconvenient to have a functioning instance of the data API service, as it also requires MonogDB. To this end a mock API is provided which acts like the real data API and doesn't require MonogDB. The mock API uses [JSON Server](https://github.com/typicode/json-server) as a simple REST server

Before starting you will need to create a `db.json` file, this should live in the `mock-api` sub-directory. Two sample files are provided, so simply copy & rename `db.demo.json` or `db.empty.json`. The demo version contains some sample demo data. Note. the `db.json` file will be written too and modified by the mock API

To start the mock API, just run:
```
npm run mock-api
```
The mock API server will start on localhost on port 4000 (just like the real data API), therefore set `VUE_APP_API_ENDPOINT=http://localhost:4000/api` in `.env.development`


# Security
By default all authentication & security is disabled, this means users have unrestricted access to admin sections of the UI (presently the 'reports' view & the 'events admin' view). For use in demos, workshops and labs this is mostly likely the desired behavior.   
Note. Admin views are denoted with yellow buttons on the navbar, over on the right

Should you want to host Smilr permanently somewhere or to investigate how to secure SPA apps, then authentication & security can be enabled

To secure the Smilr client app we use Azure Active Directory v2 and the OAuth 2.0 Implicit Grant flow. [As described in the Azure docs here](https://docs.microsoft.com/en-us/azure/active-directory/develop/v2-oauth2-implicit-grant-flow)

Setting the configuration `AAD_CLIENT_ID` (or `VUE_APP_AAD_CLIENT_ID` when running locally) will switch on security. The value should be the client id of an [app registered with Azure AD](https://docs.microsoft.com/en-us/azure/active-directory/develop/quickstart-register-app). Setting this changes the app behavior in two ways

- The *Report* and *Admin* components will be protected by a Vue route guard. This guard checks that there is a logged in user and the user is in the list of admins. If there is no logged in user, they are redirected to the *Login* component.
- If there is a logged in user, all HTTP requests to the data API will include that user's access token as a JWT in the **authorization** header, as described in the standard [OAuth 2.0 Bearer Token scheme](https://tools.ietf.org/html/rfc6750).

The Login component uses the MSAL.js library to authenticate using the configured `AAD_CLIENT_ID`. As we are a SPA this is done with a popup rather than a redirect.

The user is held as global object exported from `main.js` called `userProfile` It is checks against this object that determines if a user is logged in. This object holds three things
- `user`: MSAL **Account** object, [described here](https://github.com/AzureAD/microsoft-authentication-library-for-js/blob/dev/lib/msal-core/src/Account.ts)
- `isAdmin`: Boolean flag set at login after user is checked against the list of users in `ADMIN_USER_LIST`
- `token`: The *access* token returned by MSAL, which is a Base64 encoded JWT string

> Note. When `AAD_CLIENT_ID` is unset and security disabled, then a fake shallow `userProfile` is created with `isAdmin` set to true and a dummy MSAL user object. This results in passing all the user checks, so the app functions as if you are logged in.

# Design notes
Todo
- UI design
- Use of mixin
- App init logic
- Routing