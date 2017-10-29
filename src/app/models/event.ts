import { Topic } from './topic';

// Basic model to hold a event

export class Event {
  id: string;
  label: string;
  type: string;
  desc: string;
  start: Date;
  end: Date;
  topics: Topic[];
}

var EventTypes = [ 'event', 'workshop', 'hack', 'lab' ];
export default EventTypes;