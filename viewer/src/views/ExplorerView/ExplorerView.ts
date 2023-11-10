import { ViewerState } from '../../viewerState';

import './styles.css';

export interface DatabaseItem {
    filename: string;
    tables: string[];
}

export class ExplorerView {
    private containerEl: HTMLElement;

    private expandedItems: { [dbFilepath: string]: boolean } = {};

    private dbs: DatabaseItem[];

    private selectedItem: HTMLElement | null = null;

    constructor(rootEl: HTMLDivElement) {
        this.dbs = [];

        const dbListHeader = document.createElement('div');
        dbListHeader.className = 'viewHeader';
        dbListHeader.innerText = 'Database List';

        rootEl.appendChild(dbListHeader);

        this.containerEl = document.createElement('div');
        this.containerEl.id = 'explorer_tree';
        rootEl.appendChild(this.containerEl);
    }

    public addDatabaseItem(databaseItem: DatabaseItem): void {
        this.dbs.push(databaseItem);

        this.addDbToDom(databaseItem);

        if (this.selectedItem === null) {
            const firstTable = document.querySelector(
                '#explorer_tree > .table'
            ) as HTMLElement | undefined;
            if (firstTable) {
                this.selectTable(firstTable, databaseItem);
            }
        }
    }

    private addDbToDom(databaseItem: DatabaseItem) {
        const dbRoot = document.createDocumentFragment();

        const dbItem = document.createElement('div');
        dbItem.innerText = databaseItem.filename;
        dbItem.className = 'db';

        const expandArrow = document.createElement('div');
        expandArrow.className = 'expand';
        expandArrow.innerText = '>';
        expandArrow.style.cursor = 'pointer';
        expandArrow.onclick = () => {
            this.expandedItems[databaseItem.filename] =
                !this.expandedItems[databaseItem.filename];

            expandArrow.classList.toggle('expanded');
        };
        expandArrow.classList.add('expanded');
        dbItem.appendChild(expandArrow);

        dbRoot.appendChild(dbItem);
        databaseItem.tables.forEach((table) => {
            const tableItem = document.createElement('div');
            tableItem.className = 'table';
            tableItem.onclick = () => {
                this.selectTable(tableItem, databaseItem);
            };

            const tableItemInner = document.createElement('div');
            tableItemInner.innerText = table;
            tableItem.appendChild(tableItemInner);

            dbRoot.appendChild(tableItem);
        });

        this.containerEl.appendChild(dbRoot);
    }

    private selectTable(
        tableEl: HTMLElement | null,
        databaseItem: DatabaseItem
    ) {
        if (tableEl) {
            const tableName = tableEl.innerText;

            this.selectedItem?.classList.remove('selected');
            tableEl.classList.add('selected');
            this.selectedItem = tableEl;

            const databasePath = databaseItem.filename;

            ViewerState.instance.setSelectedTable({
                tableName,
                databasePath,
            });
        }
    }
}
