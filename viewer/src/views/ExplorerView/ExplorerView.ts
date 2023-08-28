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

    constructor(
        rootEl: HTMLDivElement,
        private onTableClicked: (tableName: string) => void
    ) {
        this.dbs = [];
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
            this.selectTable(firstTable);
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
            tableItem.innerText = table;
            tableItem.className = 'table';
            tableItem.onclick = () => {
                this.selectTable(tableItem);
            };

            dbRoot.appendChild(tableItem);
        });

        this.containerEl.appendChild(dbRoot);
    }

    private selectTable(tableEl: HTMLElement | null) {
        if (tableEl) {
            const tableName = tableEl.innerText;

            this.selectedItem?.classList.remove('selected');
            tableEl.classList.add('selected');
            this.selectedItem = tableEl;

            this.onTableClicked(tableName);
        }
    }
}
