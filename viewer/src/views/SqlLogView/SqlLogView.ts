import { Query } from 'src/QueryRunner';
import * as Bus from '../../bus';
import './styles.css';

class SqlLogView {
    textArea: HTMLTextAreaElement;

    constructor(rootEl: HTMLDivElement) {
        Bus.listen('query-run', (query) => {
            if (query.errorMsg) {
                this.textArea.value += `Error while running previous query: ${query.errorMsg}\n`;
            } else {
                this.textArea.value += `${query.sql}\n`;
            }
        });

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

export function createSqlLogView(rootEl: HTMLDivElement) {
    return new SqlLogView(rootEl);
}
