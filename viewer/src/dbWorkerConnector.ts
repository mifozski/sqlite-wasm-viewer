import { collectDbFiles } from './dbScanner';
import { Config } from './index';
import * as Bus from './bus';
import { DatabaseItem } from './views/ExplorerView/ExplorerView';
import { Database, DbWorkerOutput } from './types';

export function connectToWorker(config: Config) {
    const worker = new Worker(new URL('./DbWorker', import.meta.url), {
        type: 'module',
    });
    const collectDbFilesPromise = collectDbFiles(config.isSqliteDatabase);

    const dbs: { [dbFilepath: string]: DatabaseItem } = {};
    worker.onmessage = (message: MessageEvent<DbWorkerOutput>): void => {
        if (message.data.type === 'onReady') {
            const db: Database = {
                post: (mess) => {
                    worker.postMessage(mess);
                },
                on: (mess) => {
                    worker.onmessage?.(mess);
                },
            };
            Bus.emit('db-connector-ready', db);

            collectDbFilesPromise.then((dbFiles) => {
                dbFiles.forEach((dbFile) => {
                    const dbFilepath = dbFile;
                    const dbName = dbFile;
                    dbs[dbFilepath] = {
                        filename: dbName,
                        tables: [],
                    };
                    worker.postMessage({
                        type: 'readSchema',
                        path: dbFile,
                    });
                });
            });
        } else if (message.data.type === 'onSchema') {
            const tables = message.data.schema.map((tableSchema) => {
                return tableSchema[0];
            });
            dbs[message.data.dbName].tables = tables;

            Bus.emit('db-found', dbs[message.data.dbName]);
        } else if (message.data.type === 'onQuery') {
            Bus.emit('query-results', message.data);
        } else if (message.data.type === 'error') {
            Bus.emit('query-run', {
                sql: message.data.sql,
                errorMsg: message.data.errorMsg,
                parameters: [],
            });
        }
    };

    worker.postMessage({ type: 'init' });
}
