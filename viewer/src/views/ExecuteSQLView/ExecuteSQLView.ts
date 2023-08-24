import { highlight } from 'sql-highlight';

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

        const editorContainer = document.createElement('div');
        editorContainer.id = 'execute_sql_editor';

        this.textArea = document.createElement('textarea');
        this.textArea.id = 'execute_sql_textarea';
        this.textArea.onkeyup = this.handleSqlChanged.bind(this);
        editorContainer.appendChild(this.textArea);

        const preCode = document.createElement('pre');
        preCode.id = 'execute_sql_highlighting';
        this.highlighting = document.createElement('code');
        this.highlighting.className = 'highlighting';
        preCode.appendChild(this.highlighting);
        editorContainer.appendChild(preCode);

        container.appendChild(editorContainer);

        const executeBtn = document.createElement('button');
        executeBtn.innerText = 'Execute SQL';
        executeBtn.onclick = this.handleExecuteSql.bind(this);
        container.appendChild(executeBtn);

        this.rootEl.appendChild(container);
    }

    private handleExecuteSql() {
        if (this.textArea.value) {
            this.queryRunner.runQuery({
                sql: this.textArea.value,
                parameters: [],
            });
        }
    }

    setDb(queryRunner: QueryRunner) {
        this.queryRunner = queryRunner;
    }

    handleSqlChanged(event) {
        const target = event.target as HTMLTextAreaElement;

        const highlighted = highlight(target.value, {
            html: true,
        });

        if (highlighted.length === 0) {
            this.highlighting.innerHTML = target.value;
            return;
        }
        this.highlighting.innerHTML = highlighted;
    }
}
