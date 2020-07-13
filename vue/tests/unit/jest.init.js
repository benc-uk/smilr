// This stubs out fetch calls when running tests, i.e. on server
//import fetch from 'isomorphic-fetch'
import { config } from '@vue/test-utils'

config.mocks['$config'] = {
  API_ENDPOINT: '/api',
  AAD_CLIENT_ID: ''
}
