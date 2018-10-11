# Smilr - Native Mobile App

A simple but fully functional mobile app client for Smilr. 

Written using Nativescript + Vue.js

- https://nativescript-vue.org/

Only Android has been built/tested, it *should* also build on iOS, if you try it please let me know. I'd be interested in the result.

## Pre-reqs

You will need a LOT of pre-reqs, not least, Node.js, Java JDK 8, and the Android SDK / Android Studio.

A good starting point is here: https://nativescript-vue.org/en/docs/getting-started/installation/

## Building / Testing

``` bash
# Install dependencies
npm install

# Build, watch for changes and run the application
tns run <platform> --bundle

# Build for production
tns build <platform> --bundle

# Build, watch for changes and debug the application
tns debug <platform> --bundle
```