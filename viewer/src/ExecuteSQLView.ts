import { highlight } from 'sql-highlight';

import { Database } from './types';

export class ExecuteSQLView {
    db: Database | undefined;

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
        preCode.appendChild(this.highlighting);
        editorContainer.appendChild(preCode);

        container.appendChild(editorContainer);

        const executeBtn = document.createElement('button');
        executeBtn.innerText = 'Execute SQL';
        executeBtn.onclick = this.handleExecuteSQL;
        container.appendChild(executeBtn);

        this.rootEl.appendChild(container);
    }

    private handleExecuteSQL() {
        this.db.post({
            type: 'query',
            query: { sql: this.textArea.value, parameters: [] },
        });
    }

    setDb(db: Database) {
        this.db = db;
    }

    handleSqlChanged(event) {
        const target = event.target as HTMLTextAreaElement;

        const highlighted = highlight(target.value, {
            html: true,
        });

        this.highlighting.innerHTML = highlighted;

        // console.log(highlighted);
    }
}
