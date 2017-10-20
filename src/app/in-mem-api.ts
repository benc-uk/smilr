import { InMemoryDbService } from 'angular-in-memory-web-api';
import { environment } from '../environments/environment';

export class InMemService implements InMemoryDbService {
  createDb() {
    let topics = [
      { id: 'workshop', desc: 'Goat heardIng workshop' },
      { id: 'piano', desc: 'Learn the tuba with Lemmy from Motorhead' },
      { id: 'kube', desc: 'Something about Kubernetes' },
      { id: 'test', desc: 'Monkey Tennis' }
    ];
    let feedback = [
      { id: 1, topic: 'workshop', rating: 5, comments: "Best workshop on goats, I've been to this week!" },
      { id: 2, topic: 'workshop', rating: 2, comments: "Awful, too much goat" },
      { id: 3, topic: 'kube', rating: 4, comments: "I like containers" },
    ];    

    //console.log(environment.production)
    if(!environment.production) {
      return {topics, feedback};
    } else {
      return {};
    }
  }
}