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

> :speech_balloon: **Important!** The app will still require a functioning API, so you either need to start the mock API or to point to a real data-api service with the configuration (see below) 
```
npm run serve
```

### Compile & Bundle for Production
To build, bundle and minify the app using Webpack. The resulting output will be placed into the `dist` subdirectory (i.e. `/vue/dist` from main project root). This output is ready to be served via the Node frontend service 
```
npm run build
```


# Project Structure
Some notes on the overall structure of the `/vue` directory, and some key source files.

The project is a standard Vue CLI template project and has been split logically into a number of Vue components and also some Vue mixins, so you will find:

- `./src` - All source code
- `./src/main.js` - App entry point, all initialisation done here and mounting of **App** component
- `./src/App.vue` - Main top level **App** component
- `./src/router.js` - Handles routing, and error and security checkis

Other notable files/directories:

- `./src/components` - All Vue components as .vue files
- `./src/mixins` - Several helper Vue mixins
- `./src/mixins/api.js` - This mixin provides methods for calling the Smilr API 
- `./src/auth` - Helper classes used for AAD authentication
- `./public` - Static content and index.html
- `./mock-api` - Fake API server, see below

# Configuration
Configuration of any SPA can be tricky as they run entirely in the user's browser. For Smilr config is done either by [Vue CLI's environmental variable support](https://cli.vuejs.org/guide/mode-and-env.html) or a custom runtime configuration endpoint. Which is used is dependant which 'mode' the app is running in

## Development Mode
In this mode

## Production Mode

# Mock API
