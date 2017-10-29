import { InMemoryDbService } from 'angular-in-memory-web-api';
import { environment } from '../environments/environment';

export class InMemService implements InMemoryDbService {
  createDb() {
    let events = [
      { 
        id: 'azure',
        desc: 'Azure App Dev Workshop', 
        type: 'workshop', 
        start: '2017-10-26', 
        end: '2019-05-19',
        topics: [
          {id: 1, desc: 'General' }
        ]
      },
      { 
        id: 'paas',
        desc: 'Introduction to PaaS', 
        type: 'event', 
        start: '2017-10-26', 
        end: '2018-12-07',
        topics: [
          {id: 1, desc: 'Morning Session'},
          {id: 2, desc: 'Afternoon Session'}
        ]
      }
    ];
    let feedback = [
      { 
        id: 1, 
        event: 'azure',
        topic: 1,
        rating: 5, 
        comment: "Best workshop on Azure, I've been to this week!"
      },
      { 
        id: 2, 
        event: 'paas',
        topic: 1,
        rating: 5, 
        comment: "I loved the morning session!"
      },
      { 
        id: 3, 
        event: 'paas',
        topic: 2,
        rating: 1, 
        comment: "I hated the afternoon"
      },
      { 
        id: 4, 
        event: 'paas',
        topic: 2,
        rating: 3, 
        comment: "The PaaS afternoon was ok"
      }                  
    ];    

    //console.log(environment.production)
    if(!environment.production) {
      return {events, feedback};
    } else {
      return {};
    }
  }
}