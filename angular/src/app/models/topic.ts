import { Feedback } from './feedback';

// Very basic model to hold a topic

export class Topic {
    id: number;
    desc: string;
    feedback: Feedback[];
}