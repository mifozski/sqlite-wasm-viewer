import { isDirty, selectCell, selectedTable, setDirty } from '../../state';
import * as Bus from '../../bus';
import { ListVirtualizer } from '../../ListVirtualizer';
import { queryRunner } from '../../QueryRunner';
import { TableViewModel } from './TableViewModel';
import './styles.css';

export class TableView {
    private container: HTMLDivElement;

    private viewHeader: HTMLDivElement;

    private viewHeaderTitle: HTMLSpanElement;

    private headerRow: HTMLTableRowElement;

    private bodyRoot: HTMLTableSectionElement;

    private virtualizer: ListVirtualizer;

    private updateTimer: number | null = null;

    private model: TableViewModel;

    constructor(private rootElement: HTMLDivElement) {
        this.buildDomTemplate();

        this.model = new TableViewModel();

        Bus.listen('table-selected', (table) => {
            this.setTable(table.tableName);
        });

        Bus.listen('query-results', (data) => {
            if (data?.label === 'tableViewColumns') {
                this.setTableColumns(data.result.resultRows || []);
            } else if (data?.label === 'tableView') {
                this.setTableResults(data.result.resultRows || []);
            }
        });

        Bus.listen('cell-edited', ({ cell, value }) => {
            const row = this.model.rows.find((r) => r.rowid === cell.cellRowId);
            if (row) {
                row[cell.columnName] = value;
                this.virtualizer.update();
            }
        });

        this.virtualizer = new ListVirtualizer({
            width: 500,
            height: 930,
            totalRows: 0,
            itemHeight: 40,
            contentRoot: this.bodyRoot,
            container: this.container,
            generatorFn: (i: number) => {
                const row = this.model.rows[i];

                if (!row) {
                    return null;
                }

                const tr = document.createElement('tr');

                const rowId = row.rowid;

                tr.onclick = (event) => {
                    const element = (event.target as HTMLElement | null)
                        ?.parentElement;
                    if (element?.id) {
                        const value = row[element.id];

                        selectCell({
                            value,
                            cellRowId: rowId,
                            columnName: element.id,
                            tableName: selectedTable()?.tableName || '',
                        });
                        if (this.model.selectedCell) {
                            this.model.selectedCell.classList.remove(
                                'selected'
                            );
                        }
                        element.classList.add('selected');
                        this.model.selectedCell = element;
                    }
                };

                Object.keys(row).forEach((columnKey) => {
                    if (columnKey === 'rowid') {
                        return;
                    }

                    const value = row[columnKey];
                    const td = document.createElement('td');
                    td.id = columnKey;
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
        this.model.rows = rows;

        this.viewHeaderTitle.innerHTML = this.model.tableName;

        this.virtualizer.setRowCount(rows.length);
    }

    setTableColumns(columns: { name: string }[]) {
        this.model.columnNames = columns.map((column) => column.name);
        this.buildHeader();
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
            this.requestRows(true);
        };
        this.viewHeader.appendChild(updateBtn);

        const saveBtn = document.createElement('button');
        saveBtn.innerText = 'Save changes';
        saveBtn.onclick = () => {
            this.saveChanges();
        };
        saveBtn.setAttribute('disabled', '');
        this.viewHeader.appendChild(saveBtn);

        const revertBtn = document.createElement('button');
        revertBtn.innerText = 'Revert changes';
        revertBtn.onclick = () => {
            this.revertChanges();
        };
        revertBtn.setAttribute('disabled', '');
        this.viewHeader.appendChild(revertBtn);

        const dropTableBtn = document.createElement('button');
        dropTableBtn.innerText = 'Delete table';
        dropTableBtn.onclick = () => {
            this.deleteTable();
        };
        this.viewHeader.appendChild(dropTableBtn);

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

        Bus.listen('db-dirtied', (dirty) => {
            if (dirty) {
                saveBtn.removeAttribute('disabled');
                revertBtn.removeAttribute('disabled');
            } else {
                saveBtn.setAttribute('disabled', '');
                revertBtn.setAttribute('disabled', '');
            }
        });
    }

    private buildHeader() {
        if (this.model.columnNames.length === 0) {
            return;
        }

        this.headerRow.innerHTML = '';
        this.model.columnNames.forEach((column) => {
            const columnHeader = document.createElement('th');
            columnHeader.className = 'columnHeaderCell';

            columnHeader.innerHTML = column;

            const filterFieldCell = document.createElement('th');
            filterFieldCell.className = 'columnFilterCell';
            const filterInput = document.createElement('input');
            if (this.model.fitlers[column]) {
                filterInput.value = this.model.fitlers[column];
            }
            filterInput.onkeydown = (event) => {
                if (event.key === 'Escape') {
                    filterInput.value = '';
                    this.model.fitlers[column] = '';
                    this.scheduleUpdate();
                }
            };
            filterInput.oninput = () => {
                this.model.fitlers[column] = filterInput.value;
                this.scheduleUpdate();
            };

            filterInput.onmouseover = () => {};

            filterInput.placeholder = 'Filter';

            filterFieldCell.appendChild(filterInput);

            this.headerRow.appendChild(columnHeader);

            columnHeader.appendChild(filterFieldCell);
        });
    }

    private setTable(name: string) {
        if (this.model.tableName === name) {
            return;
        }

        this.model.tableName = name;
        this.model.columnNames = [];
        this.model.fitlers = {};

        this.requestRows(true);
    }

    private requestRows(refetchColumns: boolean): void {
        if (refetchColumns) {
            const sql = `PRAGMA table_info(${this.model.tableName});`;

            queryRunner.runQuery({ sql, parameters: [] }, 'tableViewColumns');
        }

        let sql = `SELECT "_rowid_" as rowid,* FROM ${this.model.tableName}`;

        const filterSql: string[] = [];
        Object.entries(this.model.fitlers).forEach((filterEntry) => {
            const column = filterEntry[0];
            const filter = filterEntry[1];

            if (filter) {
                filterSql.push(`"${column}" LIKE '%${filter}%'`);
            }
        });

        if (filterSql.length > 0) {
            sql += ` WHERE ${filterSql.join(' AND ')} ESCAPE '\\'`;
        }

        queryRunner.runQuery({ sql, parameters: [] }, 'tableView');
    }

    private saveChanges(): void {
        const sql = 'RELEASE "RESTOREPOINT";';
        queryRunner.runQuery({ sql, parameters: [] });
        setDirty(false);
    }

    private revertChanges(): void {
        const sql = 'ROLLBACK TO SAVEPOINT "RESTOREPOINT";';
        queryRunner.runQuery({ sql, parameters: [] });

        this.requestRows(true);

        setDirty(false);
    }

    private deleteTable(): void {
        const table = selectedTable();
        if (!table) {
            return;
        }

        if (!isDirty()) {
            queryRunner?.runQuery({
                sql: 'SAVEPOINT "RESTOREPOINT"',
                parameters: [],
            });
        }

        const sql = `DROP TABLE "${table.tableName}";`;
        queryRunner.runQuery({ sql, parameters: [] });

        setDirty(true);
    }

    private scheduleUpdate() {
        if (this.updateTimer !== null) {
            window.clearTimeout(this.updateTimer);
        }
        this.updateTimer = window.setTimeout(() => {
            this.requestRows(false);
            this.updateTimer = null;
        }, 300);
    }
}

let _tableView: TableView | undefined;

export function createTableView(rootEl: HTMLDivElement) {
    if (!_tableView) {
        _tableView = new TableView(rootEl);
    } else {
        console.warn('TableView is already created');
    }
}
