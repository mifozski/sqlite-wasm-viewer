/*
 * Copyright 2023-present MysticEggs Co. All rights reserved.
 */

// @ts-expect-error Missing types
import sqlite3InitModule from '@sqlite.org/sqlite-wasm';
import { DbWorkerInput, DbWorkerOutput } from './types';

export class DbViewerWorker {
    private initialized = false;

    sqliteApi: any;

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
                this.sqliteApi = sqlite3;
                // this.sqliteApi = sqlite3.capi;
                // console.log(sqlite3);
                // this.sqliteDb = new sqlite3.oo1.OpfsDb(
                //     `/mininote/${dbName}.db`,
                //     'c'
                // );
                // console.log(this.sqliteDb);

                const dbs = await collectDbFiles();

                this.initialized = true;
                this.sendMessage({ type: 'onReady', dbs });
            });
        }

        switch (message.data.type) {
            case 'readSchema':
                {
                    const { path } = message.data;

                    this.sqliteDb = new this.sqliteApi.oo1.OpfsDb(path, 'c');

                    const sql = `SELECT name, sql FROM sqlite_master WHERE type='table' ORDER BY name`;

                    const result = this.sqliteDb.exec({
                        sql,
                        returnValue: 'resultRows',
                    });

                    this.sendMessage({ type: 'onSchema', schema: result });

                    console.log('scqliteDb:', this.sqliteDb);
                }
                break;
            case 'query':
                {
                    const { sql, parameters } = message.data.query;

                    const rawStatement = this.sqliteDb.prepare(sql);

                    const isReader =
                        this.sqliteApi.sqlite3_column_count(rawStatement) > 1;
                    // console.log('rawStatement col count:', isReader);
                    const resultRows = [];
                    try {
                        // console.log('params:', parameters);
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
                            requestId: message.data.requestId,
                            result: { resultRows },
                        });
                    } else {
                        const changes = this.sqliteApi.sqlite3_changes(
                            this.sqliteDb.pointer
                        );
                        // console.log('totat changes:', changes);
                        const lastInsertRowid =
                            this.sqliteApi.sqlite3_last_insert_rowid(
                                this.sqliteDb.pointer
                            );

                        const updates = { changes, lastInsertRowid };

                        this.sendMessage({
                            type: 'onQuery',
                            requestId: message.data.requestId,
                            result: { resultRows, updates },
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

async function collectDbFiles(): Promise<string[]> {
    const root = await navigator.storage.getDirectory();

    const dbFileHandlers = await getDbFiles(root);

    return Promise.all(
        dbFileHandlers.map((dbFile) => {
            return root.resolve(dbFile).then((parts) => parts.join('/'));
        })
    );
}

async function getDbFiles(
    root: FileSystemDirectoryHandle
): Promise<FileSystemFileHandle[]> {
    const dbs: FileSystemFileHandle[] = [];

    for await (const handle of root.values()) {
        const child = handle as FileSystemHandle;

        if (child.kind === 'directory') {
            const childDbs = await getDbFiles(child);
            dbs.concat(dbs, ...childDbs);
        } else if (child.name.endsWith('.db')) {
            dbs.push(child);
        }
    }

    return dbs;
}
