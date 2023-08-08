import Tree from '@widgetjs/tree';

import './styles.css';

import { DbWorkerOutput } from './types';
import { TableView } from './TableView';

let uiReady = false;

let viewer: HTMLDivElement | null = null;

let dbListEl: HTMLDivElement | null = null;

let explorerTreeEl: HTMLDivElement | null = null;

let tableViewer: TableView | null = null;

let rightPanel: HTMLDivElement | null = null;

// const tableViewEl: HTMLDivElement | null = null;

let db: {
    post: (message) => void;
    on: (message) => void;
} | null = null;

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

        rightPanel = document.createElement('div');
        rightPanel.id = 'right_panel';

        const tableViewEl = document.createElement('div');
        tableViewEl.id = 'table_view';
        rightPanel.appendChild(tableViewEl);

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
        // root data
        data: [data],
        loaded() {
            // pre-selected nodes
            // this.values = ['1-1-1', '1-1-2'];
            // output selected nodes and values
            // console.log(this.selectedNodes);
            // console.log(this.values);
            // disabled nodes
            // this.disables = ['1-1-1', '1-1-1', '1-1-2'];
        },
    });

    tree.onItemClick = (item) => {
        console.log(item);
        const sql = `SELECT * FROM ${item}`;
        db.post({ type: 'query', query: { sql } });
    };

    tree.onItemClick('notes');
}
