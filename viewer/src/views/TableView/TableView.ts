import { ViewerState } from '../../viewerState';
import { ListVirtualizer } from '../../ListVirtualizer';
import { QueryRunner } from '../../QueryRunner';
import './styles.css';
import { TableViewModel } from './TableViewMode';

export class TableView {
    private container: HTMLDivElement;

    private viewHeader: HTMLDivElement;

    private viewHeaderTitle: HTMLSpanElement;

    private headerRow: HTMLTableRowElement;

    private bodyRoot: HTMLTableSectionElement;

    private virtualizer: ListVirtualizer;

    private updateTimer: number | null = null;

    private model: TableViewModel;

    constructor(
        private viewerElem: HTMLElement,
        private rootElement: HTMLDivElement,
        private queryRunner: QueryRunner
    ) {
        this.buildDomTemplate();

        this.model = new TableViewModel();

        this.viewerElem.addEventListener('tableSelected', (event) => {
            const { detail: selectedTable } = event;
            this.setTable(selectedTable.tableName);
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

                const rowId = row.rowid ?? (i + 1).toString();

                Object.keys(row).forEach((columnKey) => {
                    if (columnKey === 'rowid') {
                        return;
                    }

                    const value = row[columnKey];
                    const td = document.createElement('td');
                    const contentEl = document.createElement('div');
                    if (value !== null) {
                        contentEl.innerHTML = value;
                    } else {
                        contentEl.innerHTML = 'NULL';
                        contentEl.className = 'nullValue';
                    }

                    td.onclick = () => {
                        ViewerState.instance.setSelectedCell({
                            value,
                            cellRowId: rowId,
                            columnName: columnKey,
                            tableName:
                                ViewerState.instance.selectedTable?.tableName ||
                                '',
                        });

                        if (this.model.selectedCell) {
                            this.model.selectedCell.classList.remove(
                                'selected'
                            );
                        }

                        td.classList.add('selected');
                        this.model.selectedCell = td;
                    };

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

        this.viewerElem.addEventListener('dbHasChanges', (event) => {
            const { detail: hasChanges } = event;

            if (hasChanges) {
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
            const filterField = document.createElement('input');
            if (this.model.fitlers[column]) {
                filterField.value = this.model.fitlers[column];
            }
            filterField.onkeydown = (event) => {
                if (event.key === 'Escape') {
                    filterField.value = '';
                    this.model.fitlers[column] = '';
                    this.scheduleUpdate();
                }
            };
            filterField.oninput = () => {
                this.model.fitlers[column] = filterField.value;
                this.scheduleUpdate();
            };
            filterField.placeholder = 'Filter';

            filterFieldCell.appendChild(filterField);

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

            this.queryRunner.runQuery(
                { sql, parameters: [] },
                'tableViewColumns'
            );
        }

        let sql = `SELECT "_rowid_",* FROM ${this.model.tableName}`;

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

        this.queryRunner.runQuery({ sql, parameters: [] }, 'tableView');
    }

    private saveChanges(): void {
        const sql = 'RELEASE "RESTOREPOINT";';
        this.queryRunner.runQuery({ sql, parameters: [] });
        ViewerState.instance.setHasChanges(false);
    }

    private revertChanges(): void {
        const sql = 'ROLLBACK TO SAVEPOINT "RESTOREPOINT";';
        this.queryRunner.runQuery({ sql, parameters: [] });

        this.requestRows(true);

        ViewerState.instance.setHasChanges(false);
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
