import { Database } from './types';

export interface Query {
    sql: string;
    parameters: any[];
}

type Listener = (query: Query) => void;

export class QueryRunner {
    private listeners: Listener[];

    constructor(private db: Database) {
        this.listeners = [];
    }

    runQuery(query: Query) {
        this.db.post({ type: 'query', query });

        this.listeners.forEach((listener) => {
            listener(query);
        });
    }

    addListener(listener: Listener): () => void {
        if (this.listeners.indexOf(listener) !== -1) {
            throw new Error('Listener is already added');
        }

        this.listeners.push(listener);

        return () => {
            this.listeners.splice(this.listeners.indexOf(listener), 1);
        };
    }
}
