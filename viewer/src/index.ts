import Tree from '@widgetjs/tree';

import './styles.css';

import { Database, DbWorkerOutput } from './types';
import { TableView } from './TableView';
import { ExecuteSQLView } from './ExecuteSQLView';

let uiReady = false;

let viewer: HTMLDivElement | null = null;

let dbListEl: HTMLDivElement | null = null;

let explorerTreeEl: HTMLDivElement | null = null;

let tableViewer: TableView | null = null;

let middlePanel: HTMLDivElement | null = null;

let rightPanel: HTMLDivElement | null = null;

// const tableViewEl: HTMLDivElement | null = null;

let db: Database | null = null;

export function showViewer(): void {
    if (!uiReady) {
        viewer = document.createElement('div');
        viewer.id = 'viewer';

        dbListEl = document.createElement('div');
        dbListEl.id = 'db_list';

        const dbListHeader = document.createElement('div');
        dbListHeader.id = 'db_list_header';
        dbListHeader.innerText = 'Database List';

        dbListEl.appendChild(dbListHeader);

        explorerTreeEl = document.createElement('div');
        explorerTreeEl.id = 'tree_root';
        dbListEl.appendChild(explorerTreeEl);

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

        // const inspector = document.createElement('div');
        // inspector.id = 'inspector';
        // rightPanel.appendChild(inspector);

        const executeSqlView = new ExecuteSQLView(rightPanel);

        viewer.append(rightPanel);

        tableViewer = new TableView(tableViewEl);

        const worker = new Worker(new URL('DbWorker.ts', import.meta.url), {
            type: 'module',
        });

        const root = {};
        worker.onmessage = (message: MessageEvent<DbWorkerOutput>): void => {
            console.log('message:', message.data);

            if (message.data.type === 'onReady') {
                root.id = message.data.dbs[0];
                root.text = message.data.dbs[0];

                message.data.dbs.forEach((db) => {
                    worker.postMessage({ type: 'readSchema', path: db });
                });
            } else if (message.data.type === 'onSchema') {
                console.log('schema:', message.data.schema);

                const tables = message.data.schema
                    .map((tableSchema) => {
                        return tableSchema[0];
                    })
                    .map((table) => {
                        return {
                            id: table,
                            text: table,
                        };
                    });

                root.children = tables;

                buildExplorerTree(root);
            } else if (message.data.type === 'onQuery') {
                console.log('onquery:', message.data);
                tableViewer.setTableResults(
                    message.data.result.tableName || 'notes',
                    message.data.result.resultRows
                );
            }
        };

        db = {
            post: (message) => {
                worker.postMessage(message);
            },
            on: (message) => {
                worker.onmessage(message);
            },
        };

        executeSqlView.setDb(db);

        worker.postMessage({ type: 'init' });

        uiReady = true;
    }

    document.body.appendChild(viewer);
}

export function hideViewer(): void {
    document.body.removeChild(viewer);
}

function buildExplorerTree(data) {
    const tree = new Tree('#tree_root', {
        data: [data],
    });

    tree.onItemClick = (item) => {
        console.log(item);
        const sql = `SELECT * FROM ${item}`;
        db.post({ type: 'query', query: { sql, parameters: [] } });
    };

    tree.onItemClick('notes');
}
