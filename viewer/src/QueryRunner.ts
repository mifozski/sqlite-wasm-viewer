import { Database } from './types';
import { ViewerState } from './viewerState';

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

    runQuery(query: Query, label?: string): void {
        const currentDatabase = ViewerState.instance.selectedTable;
        if (!currentDatabase) {
            return;
        }

        this.db.post({
            type: 'query',
            query,
            databasePath: currentDatabase.databasePath,
            label,
        });

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
