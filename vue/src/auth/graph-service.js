//
// Taken from https://github.com/sunilbandla/vue-msal-sample
//

export default class GraphService {
  constructor() {
    this.graphUrl = 'https://graph.microsoft.com/v1.0/';
  }

  getUserInfo(token) {
    const headers = new Headers({ Authorization: `Bearer ${token}` });
    const options = {
      headers
    };
    return fetch(`${this.graphUrl}/me`, options)
      .then(response => response.json())
      .catch(response => {
        throw new Error(response.text());
      });
  };
}