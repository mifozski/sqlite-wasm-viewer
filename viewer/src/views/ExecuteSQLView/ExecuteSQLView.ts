import { queryRunner } from '../../QueryRunner';

import './styles.css';

class ExecuteSQLView {
    textArea: HTMLTextAreaElement;

    highlighting: HTMLElement;

    constructor(private rootEl: HTMLDivElement) {
        this.buildDom();
    }

    private buildDom() {
        const container = document.createElement('div');
        container.id = 'execute_sql_container';

        const header = document.createElement('div');
        header.className = 'viewHeader';
        header.innerText = 'Execute SQL';
        container.appendChild(header);

        this.textArea = document.createElement('textarea');
        this.textArea.id = 'execute_sql_textarea';
        container.appendChild(this.textArea);

        const executeBtn = document.createElement('button');
        executeBtn.innerText = 'Execute SQL';
        executeBtn.onclick = this.handleExecuteSql.bind(this);
        container.appendChild(executeBtn);

        this.rootEl.appendChild(container);
    }

    private handleExecuteSql() {
        if (this.textArea.value) {
            queryRunner.runQuery({
                sql: this.textArea.value,
                parameters: [],
            });
        }
    }
}

export function createSQLExecutorView(rootEl: HTMLDivElement) {
    return new ExecuteSQLView(rootEl);
}
