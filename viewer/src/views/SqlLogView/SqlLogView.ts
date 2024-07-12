import { Query, QueryRunner } from 'src/QueryRunner';
import './styles.css';

class SqlLogView {
    textArea: HTMLTextAreaElement;

    constructor(rootEl: HTMLDivElement, queryRunner: QueryRunner) {
        queryRunner.addListener(this.handleQueryRun.bind(this));

        const container = document.createElement('div');
        container.id = 'sql_log_container';

        const header = document.createElement('div');
        header.className = 'viewHeader';
        header.innerText = 'SQL Log';

        const clearBtn = document.createElement('button');
        clearBtn.style.marginLeft = 'auto';
        clearBtn.innerText = 'Clear';
        clearBtn.onclick = () => {
            this.textArea.value = '';
        };
        header.appendChild(clearBtn);

        container.appendChild(header);

        this.textArea = document.createElement('textarea');
        this.textArea.id = 'query_log_text';
        this.textArea.readOnly = true;
        container.appendChild(this.textArea);

        rootEl.appendChild(container);
    }

    handleQueryRun(query: Query) {
        this.textArea.value += `${query.sql}\n`;
    }
}

export function initSqlLogView(
    rootEl: HTMLDivElement,
    queryRunner: QueryRunner
) {
    return new SqlLogView(rootEl, queryRunner);
}
