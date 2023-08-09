import { Database } from './types';

export class ExecuteSQLView {
    db: Database | undefined;

    textArea: HTMLTextAreaElement;

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
}
