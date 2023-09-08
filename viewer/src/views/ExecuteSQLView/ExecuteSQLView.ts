import './styles.css';

import { QueryRunner } from 'src/QueryRunner';

export class ExecuteSQLView {
    queryRunner: QueryRunner | undefined;

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
        this.rootEl.appendChild(header);

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
            this.queryRunner?.runQuery({
                sql: this.textArea.value,
                parameters: [],
            });
        }
    }

    setDb(queryRunner: QueryRunner) {
        this.queryRunner = queryRunner;
    }
}
