import { ListVirtualizer } from './ListVirtualizer';
import { Database } from './types';

export class TableView {
    private rootElement: HTMLDivElement;

    private container: HTMLDivElement;

    private viewHeader: HTMLDivElement;

    private viewHeaderTitle: HTMLSpanElement;

    private headerRoot: HTMLTableRowElement;

    private bodyRoot: HTMLTableSectionElement;

    private virtualizer: ListVirtualizer;

    private rows;

    private tableName: string;

    constructor(
        rootElement: HTMLDivElement,
        private db: Database
    ) {
        this.rootElement = rootElement;

        this.buildDomTemplate();

        this.virtualizer = new ListVirtualizer({
            width: 500,
            height: 930,
            totalRows: 0,
            itemHeight: 40,
            contentRoot: this.bodyRoot,
            container: this.container,
            generatorFn: (i: number) => {
                const row = this.rows[i];

                if (!row) {
                    return null;
                }

                const tr = document.createElement('tr');

                Object.keys(row).forEach((columnKey) => {
                    const value = row[columnKey];
                    const td = document.createElement('td');
                    const contentEl = document.createElement('div');
                    contentEl.innerHTML = value;

                    td.appendChild(contentEl);
                    tr.appendChild(td);
                });
                this.bodyRoot.appendChild(tr);

                return tr;
            },
        });
    }

    setTableResults(rows) {
        this.rows = rows;

        this.viewHeaderTitle.innerHTML = this.tableName;

        const schema = rows.length > 0 ? Object.keys(rows[0]) : [];
        this.headerRoot.innerHTML = '';
        schema.forEach((column) => {
            const th = document.createElement('th');
            th.innerHTML = column;

            this.headerRoot.appendChild(th);
        });

        this.virtualizer.setRowCount(rows.length);
    }

    buildDomTemplate() {
        this.viewHeader = document.createElement('div');
        this.viewHeader.id = 'table_view_header';

        this.viewHeaderTitle = document.createElement('span');
        this.viewHeaderTitle.id = 'table_view_header_title';
        this.viewHeader.appendChild(this.viewHeaderTitle);

        const updateBtn = document.createElement('button');
        updateBtn.innerText = 'Update';
        updateBtn.onclick = () => {
            this.requestAllRows();
        };
        this.viewHeader.appendChild(updateBtn);

        this.rootElement.appendChild(this.viewHeader);

        this.container = document.createElement('div');
        this.container.id = 'table_container';

        const table = document.createElement('table');

        const header = table.createTHead();
        this.headerRoot = document.createElement('tr');
        header.appendChild(this.headerRoot);

        this.bodyRoot = table.createTBody();
        this.container.appendChild(table);

        this.rootElement.appendChild(this.container);
    }

    public setTable(name: string) {
        if (this.tableName === name) {
            return;
        }

        this.tableName = name;

        this.requestAllRows();
    }

    private requestAllRows(): void {
        const sql = `SELECT * FROM ${this.tableName}`;
        this.db.post({ type: 'query', query: { sql, parameters: [] } });
    }
}
