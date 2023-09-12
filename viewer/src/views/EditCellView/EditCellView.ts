import { CurrentCell } from '../../types';
import { QueryRunner } from '../../QueryRunner';
import { ViewerState } from '../../viewerState';

import './styles.css';

export class EditCellView {
    queryRunner: QueryRunner | undefined;

    textArea: HTMLTextAreaElement;

    currentCell: CurrentCell | undefined;

    constructor(
        private viewerElem: HTMLElement,
        private rootEl: HTMLDivElement
    ) {
        this.buildDom();

        viewerElem.addEventListener('cellSelected', (event) => {
            const { detail: cell } = event;
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
            if (!ViewerState.instance.hasChanges) {
                this.queryRunner?.runQuery({
                    sql: 'SAVEPOINT "RESTOREPOINT"',
                    parameters: [],
                });
            }
            this.queryRunner?.runQuery({
                sql: `UPDATE ${this.currentCell?.tableName} SET "${this.currentCell?.columnName}"=? WHERE "_rowid_"='${this.currentCell?.cellRowId}'`,
                parameters: [this.textArea.value],
            });

            ViewerState.instance.setHasChanges(true);
        }
    }

    setDb(queryRunner: QueryRunner) {
        this.queryRunner = queryRunner;
    }
}
