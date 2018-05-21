import { Topic } from './topic';

// Basic model to hold a event

export class Event {
  id: any;
  title: string;
  type: string;
  start: Date;
  end: Date;
  topics: Topic[];
}

var EventTypes = [ 'event', 'workshop', 'hack', 'lab' ];
export default EventTypes;