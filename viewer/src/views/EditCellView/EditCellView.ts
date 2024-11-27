import * as Bus from '../../bus';
import { queryRunner } from '../../QueryRunner';
import { isDirty, setDirty } from '../../state';
import { CurrentCell } from '../../types';

import './styles.css';

export class EditCellView {
    textArea: HTMLTextAreaElement;

    currentCell: CurrentCell | undefined;

    constructor(private rootEl: HTMLDivElement) {
        this.buildDom();

        Bus.listen('cell-selected', (cell) => {
            this.currentCell = cell;
            this.textArea.value = cell.value;
            this.textArea.select();
        });
    }

    private buildDom() {
        const container = document.createElement('div');
        container.id = 'execute_sql_container';

        const header = document.createElement('div');
        header.className = 'viewHeader';
        header.innerText = 'Edit Cell';
        container.appendChild(header);

        this.textArea = document.createElement('textarea');
        this.textArea.id = 'execute_sql_textarea';
        container.appendChild(this.textArea);

        const executeBtn = document.createElement('button');
        executeBtn.innerText = 'Apply';
        executeBtn.onclick = this.handleApplyEdit.bind(this);
        container.appendChild(executeBtn);

        this.rootEl.appendChild(container);
    }

    private handleApplyEdit() {
        if (this.textArea.value) {
            if (!isDirty()) {
                queryRunner.runQuery({
                    sql: 'SAVEPOINT "RESTOREPOINT"',
                    parameters: [],
                });
            }
            queryRunner.runQuery({
                sql: `UPDATE ${this.currentCell?.tableName} SET "${this.currentCell?.columnName}"=? WHERE "_rowid_"='${this.currentCell?.cellRowId}'`,
                parameters: [this.textArea.value],
            });
            if (this.currentCell) {
                Bus.emit('cell-edited', {
                    cell: this.currentCell,
                    value: this.textArea.value,
                });
            }

            setDirty(true);
        }
    }
}

export function createEditCellView(rootEl: HTMLDivElement) {
    return new EditCellView(rootEl);
}
