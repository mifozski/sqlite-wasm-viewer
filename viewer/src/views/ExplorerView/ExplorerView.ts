import { ViewerState } from '../../viewerState';

import './styles.css';

export interface DatabaseItem {
    filename: string;
    tables: string[];
}

type SelectedTable = {
    tableName: string;
    dbName: string;
    tableElem: HTMLElement;
};

const EXPANDED_EXPLORER_ITEMS_KEY = 'expanded_explorer_items';

export class ExplorerView {
    private containerEl: HTMLElement;

    private expandedItems: { [dbFilepath: string]: boolean } = {};

    private dbs: DatabaseItem[];

    private selectedItem: SelectedTable | null = null;

    private showFullItemLabelTimeout = 0;

    private fullItemLabelEl: HTMLDivElement;

    constructor(rootEl: HTMLDivElement, viewEl: HTMLDivElement) {
        this.dbs = [];
        this.scheduleShowFullItemLabel =
            this.scheduleShowFullItemLabel.bind(this);
        this.hideFullItemLabel = this.hideFullItemLabel.bind(this);

        const dbListHeader = document.createElement('div');
        dbListHeader.className = 'viewHeader';
        dbListHeader.innerText = 'Database List';

        rootEl.appendChild(dbListHeader);

        this.containerEl = document.createElement('div');
        this.containerEl.id = 'explorer_tree';
        rootEl.appendChild(this.containerEl);

        this.expandedItems = JSON.parse(
            localStorage.getItem(EXPANDED_EXPLORER_ITEMS_KEY) ?? '{}'
        );

        this.fullItemLabelEl = document.createElement('div');
        this.fullItemLabelEl.id = 'full_label';
        this.fullItemLabelEl.style.display = 'none';
        viewEl.appendChild(this.fullItemLabelEl);
    }

    public addDatabaseItem(databaseItem: DatabaseItem): void {
        this.dbs.push(databaseItem);

        this.buildDom();

        if (this.selectedItem === null) {
            const firstTable = document.querySelector(
                '#explorer_tree .table'
            ) as HTMLElement | undefined;
            if (firstTable) {
                this.selectTable(firstTable, databaseItem);
            }
        }
    }

    private buildDom() {
        this.containerEl.innerHTML = '';
        this.dbs.forEach((db) => {
            this.buildDbGroupDom(db);
        });
    }

    private buildDbGroupDom(db: DatabaseItem) {
        const dbRoot = document.createDocumentFragment();

        const dbItem = document.createElement('div');
        this.setupCommonItemDom(dbItem);

        this.setupLabelDom(dbItem, db.filename);

        dbItem.classList.add('db');
        dbItem.addEventListener('mouseenter', this.scheduleShowFullItemLabel);
        dbItem.addEventListener('mouseleave', this.hideFullItemLabel);

        const tablesContainer = document.createElement('div');

        const isExpanded = !(this.expandedItems[db.filename] === false);

        this.buildExpandArrowDom(dbItem, tablesContainer, db, isExpanded);

        dbRoot.appendChild(dbItem);

        db.tables.forEach((table) => {
            this.buildTableDom(tablesContainer, table, db);
        });

        tablesContainer.style.display = isExpanded ? 'block' : 'none';

        dbRoot.appendChild(tablesContainer);

        this.containerEl.appendChild(dbRoot);
    }

    private buildExpandArrowDom(
        itemElem: HTMLElement,
        tablesContainer: HTMLElement,
        db: DatabaseItem,
        isExpanded: boolean
    ) {
        const expandArrow = document.createElement('div');
        expandArrow.className = 'expand';
        expandArrow.innerHTML = '&#9656;';
        expandArrow.style.cursor = 'pointer';

        if (isExpanded) {
            expandArrow.classList.add('expanded');
        }

        expandArrow.onclick = () => {
            this.expandedItems[db.filename] = !this.expandedItems[db.filename];

            tablesContainer.style.display = this.expandedItems[db.filename]
                ? 'block'
                : 'none';

            expandArrow.classList.toggle('expanded');

            localStorage.setItem(
                EXPANDED_EXPLORER_ITEMS_KEY,
                JSON.stringify(this.expandedItems)
            );
        };
        itemElem.appendChild(expandArrow);
    }

    private buildTableDom(
        tablesContainer: HTMLElement,
        tableName: string,
        db: DatabaseItem
    ) {
        const tableItem = document.createElement('div');
        this.setupCommonItemDom(tableItem);

        tableItem.classList.add('table');
        tableItem.onclick = () => {
            this.selectTable(tableItem, db);
        };

        if (
            this.selectedItem?.tableName === tableName &&
            this.selectedItem?.dbName === db.filename
        ) {
            this.selectedItem.tableElem = tableItem;
            tableItem.classList.add('selected');
        }

        this.setupLabelDom(tableItem, tableName);

        tablesContainer.appendChild(tableItem);
    }

    private selectTable(
        tableEl: HTMLElement | null,
        databaseItem: DatabaseItem
    ) {
        if (tableEl) {
            const tableName = tableEl.innerText;

            this.selectedItem?.tableElem.classList.remove('selected');
            tableEl.classList.add('selected');

            this.selectedItem = {
                dbName: databaseItem.filename,
                tableName: tableEl.innerText,
                tableElem: tableEl,
            };

            const databasePath = databaseItem.filename;

            ViewerState.instance.setSelectedTable({
                tableName,
                databasePath,
            });
        }
    }

    private setupCommonItemDom(item: HTMLDivElement) {
        item.classList.add('item');
        item.addEventListener('mouseenter', this.scheduleShowFullItemLabel);
        item.addEventListener('mouseleave', this.hideFullItemLabel);
    }

    private setupLabelDom(item: HTMLDivElement, text: string) {
        const label = document.createElement('div');
        label.className = 'label';
        label.innerText = text;
        item.appendChild(label);
    }

    private scheduleShowFullItemLabel(event: MouseEvent) {
        const item = event.target as HTMLDivElement;
        const label = item.querySelector('.label') as
            | HTMLDivElement
            | undefined;
        if (label && label.offsetWidth < label.scrollWidth) {
            clearTimeout(this.showFullItemLabelTimeout);
            this.showFullItemLabelTimeout = window.setTimeout(() => {
                this.showFullItemLabel(item);
            }, 300);
        }
    }

    private hideFullItemLabel() {
        clearTimeout(this.showFullItemLabelTimeout);
        this.fullItemLabelEl.style.display = 'none';
    }

    private showFullItemLabel(item: HTMLDivElement) {
        const { left, top } = item.getBoundingClientRect();

        this.fullItemLabelEl.style.display = 'block';
        this.fullItemLabelEl.style.left = `${left - 1}px`;
        this.fullItemLabelEl.style.top = `${top - 1}px`;
        this.fullItemLabelEl.style.backgroundColor =
            window.getComputedStyle(item).backgroundColor;

        const labelNode = item.querySelector('.label')!.childNodes[0];
        if (labelNode.nodeType === Node.TEXT_NODE) {
            this.fullItemLabelEl.innerText = labelNode.textContent || '';
        }
    }
}
