import './styles.css';

import { Database, DbWorkerOutput } from './types';
import { TableView } from './views/TableView/TableView';
import { ExecuteSQLView } from './views/ExecuteSQLView/ExecuteSQLView';
import { QueryRunner } from './QueryRunner';
import { initSqlLogView } from './views/SqlLogView/SqlLogView';
import { DatabaseItem, ExplorerView } from './views/ExplorerView/ExplorerView';
import { collectDbFiles } from './dbScanner';

let viewer: HTMLDivElement | null = null;

let dbListEl: HTMLDivElement | null = null;

let tableViewer: TableView | null = null;

let middlePanel: HTMLDivElement | null = null;

let rightPanel: HTMLDivElement | null = null;

let explorerView: ExplorerView | null = null;

let queryRunner: QueryRunner | null = null;

type Config = {
    isSqliteDatabase: (fileName: string) => boolean;
};

const defaultSqliteExtension = ['db', 'sqlite'];

const config: Config = {
    isSqliteDatabase: (filename: string) => {
        return defaultSqliteExtension.some((ext) =>
            filename.endsWith(`.${ext}`)
        );
    },
};

export function setConfig(userConfig: Partial<Config>) {
    Object.assign(config, userConfig);
    Object.freeze(config);
}

export function showViewer(): void {
    if (!viewer) {
        viewer = document.createElement('div');
        viewer.id = 'viewer';

        const closeBtn = document.createElement('div');
        closeBtn.id = 'close_btn';
        closeBtn.innerText = 'Close';
        closeBtn.onclick = () => {
            hideViewer();
        };
        viewer.appendChild(closeBtn);

        dbListEl = document.createElement('div');
        dbListEl.id = 'db_list';

        viewer.appendChild(dbListEl);

        // Middle Panel
        middlePanel = document.createElement('div');
        middlePanel.id = 'middle_panel';

        const tableViewEl = document.createElement('div');
        tableViewEl.id = 'table_view';
        middlePanel.appendChild(tableViewEl);

        viewer.append(middlePanel);

        // Right Panel
        rightPanel = document.createElement('div');
        rightPanel.id = 'right_panel';

        const executeSqlView = new ExecuteSQLView(rightPanel);

        viewer.append(rightPanel);

        const worker = new Worker(new URL('DbWorker.ts', import.meta.url), {
            type: 'module',
        });

        explorerView = new ExplorerView(dbListEl, (tableName) => {
            tableViewer?.setTable(tableName);
        });

        const collectDbFilesPromise = collectDbFiles(config.isSqliteDatabase);

        const dbs: { [dbFilepath: string]: DatabaseItem } = {};
        worker.onmessage = (message: MessageEvent<DbWorkerOutput>): void => {
            if (message.data.type === 'onReady') {
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

                explorerView?.addDatabaseItem(dbs[message.data.dbName]);
            } else if (message.data.type === 'onQuery') {
                tableViewer?.setTableResults(
                    message.data.result.resultRows || []
                );
            }
        };

        const db: Database = {
            post: (message) => {
                worker.postMessage(message);
            },
            on: (message) => {
                worker.onmessage?.(message);
            },
        };

        queryRunner = new QueryRunner(db);

        initSqlLogView(rightPanel, queryRunner);

        tableViewer = new TableView(tableViewEl, queryRunner);

        executeSqlView.setDb(queryRunner);

        worker.postMessage({ type: 'init' });
    }

    document.body.appendChild(viewer);
}

export function hideViewer(): void {
    if (viewer) {
        document.body.removeChild(viewer);
    }
}
