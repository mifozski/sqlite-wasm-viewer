// @ts-expect-error Missing types
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { DbWorkerInput, DbWorkerOutput } from './types';

export class DbViewerWorker {
    private initialized = false;

    sqlite: any;

    sqliteCApi: any;

    sqliteDb: any;

    constructor() {
        this.initialized = false;
        this.sqliteDb = null;
    }

    post(message: MessageEvent<DbWorkerInput>) {
        if (message.data.type !== 'init' && !this.initialized) {
            throw new Error("DbWorker not initialized with 'init' message");
        }

        if (message.data.type === 'init') {
            if (this.initialized) {
                throw new Error('DbWorker already initialized');
            }

            sqlite3InitModule().then(async (sqlite3: any) => {
                this.sqlite = sqlite3;
                this.sqliteCApi = sqlite3.capi;

                this.initialized = true;
                this.sendMessage({ type: 'onReady' });
            });
        }

        switch (message.data.type) {
            case 'readSchema':
                {
                    const { path } = message.data;

                    this.sqliteDb = new this.sqlite.oo1.OpfsDb(path, 'c');

                    const sql = `SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name`;

                    const result = this.sqliteDb.exec({
                        sql,
                        returnValue: 'resultRows',
                    });

                    this.sendMessage({
                        type: 'onSchema',
                        schema: result,
                        dbName: path,
                    });
                }
                break;
            case 'query':
                {
                    const { sql, parameters } = message.data.query;

                    const rawStatement = this.sqliteDb.prepare(sql);

                    const isReader =
                        this.sqliteCApi.sqlite3_column_count(rawStatement) > 1;
                    const resultRows: any[] = [];
                    try {
                        if (parameters?.length > 0) {
                            rawStatement.bind(parameters);
                        }

                        while (rawStatement.step()) {
                            // Kysely expects the results to be in the object mode
                            const row = rawStatement.get({});
                            resultRows.push(row);
                        }
                    } finally {
                        rawStatement.finalize();
                    }

                    if (isReader) {
                        this.sendMessage({
                            type: 'onQuery',
                            result: { resultRows, tableName: '' },
                        });
                    } else {
                        const changes = this.sqliteCApi.sqlite3_changes(
                            this.sqliteDb.pointer
                        );
                        const lastInsertRowid =
                            this.sqliteCApi.sqlite3_last_insert_rowid(
                                this.sqliteDb.pointer
                            );

                        const updates = { changes, lastInsertRowid };

                        this.sendMessage({
                            type: 'onQuery',
                            result: { resultRows, updates, tableName: '' },
                        });
                    }
                }
                break;

            default:
                break;
        }
    }

    sendMessage(message: DbWorkerOutput) {
        postMessage(message);
    }
}
