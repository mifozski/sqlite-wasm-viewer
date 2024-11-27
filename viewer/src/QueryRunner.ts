import * as Bus from './bus';
import { selectedTable } from './state';
import { Database } from './types';

export interface Query {
    sql: string;
    parameters: any[];
    errorMsg?: string;
}

export class QueryRunner {
    private db: Database;

    constructor() {
        Bus.listen('db-connector-ready', (db) => {
            this.db = db;

            Bus.emit('query-runner-ready', true);
        });
    }

    runQuery(query: Query, label?: string): void {
        if (!this.db) {
            return;
        }

        const currentTable = selectedTable();
        if (!currentTable) {
            return;
        }

        this.db.post({
            type: 'query',
            query,
            databasePath: currentTable.databasePath,
            label,
        });

        Bus.emit('query-run', query);
    }
}

export const queryRunner = new QueryRunner();
