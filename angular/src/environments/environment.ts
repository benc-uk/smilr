// The file contents for the current environment will overwrite these during build.
// The build system defaults to the dev environment which uses `environment.ts`, but if you do
// `ng build --env=prod` then `environment.prod.ts` will be used instead.
// The list of which env maps to which file can be found in `.angular-cli.json`.

export const environment = {
  production: false,
  secured: false,
  dataApiKey: 'REPLACETHISKEY567',

  // In dev mode: configServerVars are ignored and values are set in config section 
  // - config section is a simple sub-object of name=value pairs
  configServerVars: [],
  config: {
    API_ENDPOINT: "http://dummy.notused/api"
  }
};
