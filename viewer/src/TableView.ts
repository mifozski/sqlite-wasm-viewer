import { createTable, Table, getCoreRowModel } from '@tanstack/table-core';

export class TableView {
    private table: Table<any>;

    private rootElement: HTMLDivElement;

    private viewHeader: HTMLDivElement;

    private headerRoot: HTMLTableSectionElement;

    private bodyRoot: HTMLTableSectionElement;

    constructor(rootElement: HTMLDivElement) {
        this.rootElement = rootElement;

        this.buildDomTemplate();
    }

    setTable(tableName: string, db) {
        // const sql = `SELECT * FROM ${tableName}`;
        // db.postMessage({ type: 'query', sql });
    }

    setTableResults(tableName: string, rows) {
        this.viewHeader.innerHTML = tableName;
        console.log(rows);

        const schema = rows.length > 0 ? Object.keys(rows[0]) : [];
        // console.log(schema);

        this.table = createTable({
            data: rows,
            columns: schema.map((schemaCol) => {
                return { id: schemaCol, header: schemaCol };
            }),
            onStateChange: (state) => {
                console.log('new state:', state);
            },
            state: {},
            getCoreRowModel: getCoreRowModel(),
            renderFallbackValue: () => {
                // console.log('renderFallbackValue');
            },
        });

        this.table.setOptions((prev) => ({
            ...prev,
            state: {
                ...prev.state,
                ...this.table.initialState,
            },
        }));

        this.buildTableDom(this.table);
    }

    buildDomTemplate() {
        this.viewHeader = document.createElement('div');
        this.viewHeader.id = 'table_view_header';
        this.rootElement.appendChild(this.viewHeader);

        const tableContainer = document.createElement('div');
        tableContainer.id = 'table_container';

        const table = document.createElement('table');
        this.headerRoot = table.createTHead();
        this.bodyRoot = table.createTBody();
        tableContainer.appendChild(table);

        this.rootElement.appendChild(tableContainer);
    }

    buildTableDom(table: Table<any>) {
        this.headerRoot.innerHTML = null;
        this.bodyRoot.innerHTML = null;

        table.getHeaderGroups().forEach((group) => {
            group.headers.forEach((header) => {
                const th = document.createElement('th');
                th.innerHTML = header.column.columnDef.header;

                this.headerRoot.appendChild(th);
            });
        });

        table.getRowModel().rows.forEach((row) => {
            const tr = document.createElement('tr');

            row.getVisibleCells().forEach((cell) => {
                const td = document.createElement('td');
                const contentEl = document.createElement('div');
                const context = cell.getContext();
                const value = context.row.original[cell.column.id];
                // console.log('text:', value);
                contentEl.innerHTML = value;

                td.appendChild(contentEl);
                tr.appendChild(td);
            });
            this.bodyRoot.appendChild(tr);
        });
    }
}
