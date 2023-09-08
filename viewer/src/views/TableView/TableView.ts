import { ListVirtualizer } from '../../ListVirtualizer';
import { QueryRunner } from '../../QueryRunner';
import './styles.css';

export class TableView {
    private rootElement: HTMLDivElement;

    private container: HTMLDivElement;

    private viewHeader: HTMLDivElement;

    private viewHeaderTitle: HTMLSpanElement;

    private headerRow: HTMLTableRowElement;

    private bodyRoot: HTMLTableSectionElement;

    private virtualizer: ListVirtualizer;

    private rows;

    private tableName: string;

    private columnNames: string[] = [];

    private fitlers: { [column: string]: string } = {};

    private updateTimer: number | null = null;

    constructor(
        rootElement: HTMLDivElement,
        private queryRunner: QueryRunner
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
                    if (value !== null) {
                        contentEl.innerHTML = value;
                    } else {
                        contentEl.innerHTML = 'NULL';
                        contentEl.className = 'nullValue';
                    }

                    td.appendChild(contentEl);
                    tr.appendChild(td);
                });
                this.bodyRoot.appendChild(tr);

                return tr;
            },
        });
    }

    setTableResults(rows: any[]) {
        this.rows = rows;

        this.viewHeaderTitle.innerHTML = this.tableName;

        this.buildHeader(rows);

        this.virtualizer.setRowCount(rows.length);
    }

    buildDomTemplate() {
        this.viewHeader = document.createElement('div');
        this.viewHeader.className = 'viewHeader';

        this.viewHeaderTitle = document.createElement('span');
        this.viewHeaderTitle.id = 'table_view_header_title';
        this.viewHeader.appendChild(this.viewHeaderTitle);

        const updateBtn = document.createElement('button');
        updateBtn.innerText = 'Update';
        updateBtn.onclick = () => {
            this.requestRows();
        };
        this.viewHeader.appendChild(updateBtn);

        this.rootElement.appendChild(this.viewHeader);

        this.container = document.createElement('div');
        this.container.id = 'table_container';

        const table = document.createElement('table');

        const tableHeader = table.createTHead();
        this.headerRow = document.createElement('tr');
        tableHeader.appendChild(this.headerRow);

        this.bodyRoot = table.createTBody();
        this.container.appendChild(table);

        this.rootElement.appendChild(this.container);
    }

    private buildHeader(rows: any[]) {
        if (this.columnNames.length !== 0) {
            return;
        }

        const schema = rows.length > 0 ? Object.keys(rows[0]) : [];

        if (schema.length > 0) {
            this.columnNames = schema;
        }

        this.headerRow.innerHTML = '';
        this.columnNames.forEach((column) => {
            const columnHeader = document.createElement('th');
            columnHeader.className = 'columnHeaderCell';

            columnHeader.innerHTML = column;

            const filterFieldCell = document.createElement('th');
            filterFieldCell.className = 'columnFilterCell';
            const filterField = document.createElement('input');
            filterField.oninput = () => {
                this.fitlers[column] = filterField.value;
                this.scheduleUpdate();
            };
            filterField.placeholder = 'Filter';

            filterFieldCell.appendChild(filterField);

            this.headerRow.appendChild(columnHeader);

            columnHeader.appendChild(filterFieldCell);
        });
    }

    public setTable(name: string) {
        if (this.tableName === name) {
            return;
        }

        this.tableName = name;
        this.columnNames = [];
        this.fitlers = {};

        this.requestRows();
    }

    private requestRows(): void {
        let sql = `SELECT * FROM ${this.tableName}`;

        const filterSql: string[] = [];
        Object.entries(this.fitlers).forEach((filterEntry) => {
            const column = filterEntry[0];
            const filter = filterEntry[1];

            if (filter) {
                filterSql.push(`"${column}" LIKE '%${filter}%'`);
            }
        });

        if (filterSql.length > 0) {
            sql += ` WHERE ${filterSql.join(' AND ')} ESCAPE '\\'`;
        }

        this.queryRunner.runQuery({ sql, parameters: [] });
    }

    private scheduleUpdate() {
        if (this.updateTimer !== null) {
            window.clearTimeout(this.updateTimer);
        }
        this.updateTimer = window.setTimeout(() => {
            this.requestRows();
            this.updateTimer = null;
        }, 300);
    }
}
