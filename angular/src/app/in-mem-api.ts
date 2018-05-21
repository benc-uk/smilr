import { InMemoryDbService } from 'angular-in-memory-web-api';
import { environment } from '../environments/environment';

export class InMemService implements InMemoryDbService {

  createDb() {
    let events = [
      { 
        id: 1,
        title: 'Test Workshop', 
        type: 'workshop', 
        start: '2018-01-01', 
        end: '2018-12-03',
        topics: [
          {id: 1, desc: 'General Stuff' }
        ]
      },
      { 
        id: 2,
        title: 'Test Event', 
        type: 'event', 
        start: '2018-12-19', 
        end: '2018-12-22',
        topics: [
          {id: 1, desc: 'Morning Session'},
          {id: 2, desc: 'Afternoon Session'}
        ]
      },
      { 
        id: 3,
        title: 'Goat Herding with Bill Oddie', 
        type: 'lab', 
        start: '2017-10-07', 
        end: '2017-10-07',
        topics: [
          {id: 1, desc: 'Intro to Goats'},
          {id: 2, desc: 'More about Goats'}
        ]
      }      
    ];
    let feedback = [
      { 
        id: 1, 
        event: 1,
        topic: 1,
        rating: 5, 
        comment: "Best workshop, I've been to this week!"
      },
      { 
        id: 2, 
        event: 2,
        topic: 1,
        rating: 5, 
        comment: "I loved the morning session!"
      },
      { 
        id: 3, 
        event: 2,
        topic: 2,
        rating: 2, 
        comment: "I hated the afternoon",
        sentiment: 0.3780291
      },
      { 
        id: 3, 
        event: 2,
        topic: 2,
        rating: 3, 
        comment: "I kinda liked the afternoon"
      },      
      { 
        id: 4, 
        event: 3,
        topic: 2,
        rating: 1, 
        comment: "Bill Oddie borrowed £5 from me in 1992 and has never given it back"
      }                  
    ];    

    return {events, feedback};
  }
}