import { createTable, Table, getCoreRowModel } from '@tanstack/table-core';
import { ListVirtualizer } from './ListVirtualizer';

export class TableView {
    private table: Table<any>;

    private rootElement: HTMLDivElement;

    private container: HTMLDivElement;

    private viewHeader: HTMLDivElement;

    private headerRoot: HTMLTableRowElement;

    private bodyRoot: HTMLTableSectionElement;

    private virtualizer: ListVirtualizer;

    private rows;

    constructor(rootElement: HTMLDivElement) {
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

                // console.log('row:', row);
                if (!row) {
                    return null;
                }

                const tr = document.createElement('tr');

                Object.keys(row).forEach((columnKey) => {
                    const value = row[columnKey];
                    const td = document.createElement('td');
                    const contentEl = document.createElement('div');
                    // const context = cell.getContext();
                    // const value = context.row.original[cell.column.id];
                    // console.log('text:', value);
                    contentEl.innerHTML = value;

                    td.appendChild(contentEl);
                    tr.appendChild(td);
                });
                // row.getVisibleCells().forEach((cell) => {

                // });
                this.bodyRoot.appendChild(tr);

                return tr;
            },
        });
    }

    setTableResults(tableName: string, rows) {
        this.rows = rows;

        this.viewHeader.innerHTML = tableName;
        console.log('rows:', rows);

        const schema = rows.length > 0 ? Object.keys(rows[0]) : [];
        this.headerRoot.innerHTML = '';
        schema.forEach((column) => {
            const th = document.createElement('th');
            th.innerHTML = column;

            this.headerRoot.appendChild(th);
        });

        this.virtualizer.setRowCount(rows.length);
        return;

        this.viewHeader.innerHTML = tableName;
        console.log(rows);

        // const schema = rows.length > 0 ? Object.keys(rows[0]) : [];
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
