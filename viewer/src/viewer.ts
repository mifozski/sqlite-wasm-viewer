import { connectToWorker } from './dbWorkerConnector';
import { Config } from './index';
import { State } from './state';
import { createResizeHandler } from './utils/resizeHandler';
import { createEditCellView } from './views/EditCellView/EditCellView';
import { createSQLExecutorView } from './views/ExecuteSQLView/ExecuteSQLView';
import { createExplorerView } from './views/ExplorerView/ExplorerView';
import { createSqlLogView } from './views/SqlLogView/SqlLogView';
import { createTableView } from './views/TableView/TableView';

export class Viewer {
    _state: State;

    private _container: HTMLDivElement;

    constructor(
        config: Config,
        private onClickClose: () => void
    ) {
        this.createElements();

        connectToWorker(config);
    }

    private createElements() {
        this._container = document.createElement('div');
        this._container.id = 'viewer';

        const closeBtn = document.createElement('div');
        closeBtn.id = 'close_btn';
        closeBtn.innerText = 'Close';
        closeBtn.onclick = () => {
            this.onClickClose();
        };
        this._container.appendChild(closeBtn);

        // Left Panel
        const leftPanel = document.createElement('div');
        leftPanel.id = 'db_list';

        createExplorerView(leftPanel, this._container);

        this._container.appendChild(leftPanel);

        // Middle Panel
        const middlePanel = document.createElement('div');
        middlePanel.id = 'middle_panel';

        const listResizeHandlerEl = createResizeHandler(
            leftPanel,
            middlePanel,
            true,
            this._container
        );
        this._container.appendChild(listResizeHandlerEl);

        const tableViewEl = document.createElement('div');
        tableViewEl.id = 'table_view';
        middlePanel.appendChild(tableViewEl);

        createTableView(tableViewEl);

        this._container.append(middlePanel);

        // Right Panel
        const rightPanel = document.createElement('div');
        rightPanel.id = 'right_panel';

        const rightPanelResizeHandlerEl = createResizeHandler(
            middlePanel,
            rightPanel,
            false,
            this._container
        );
        this._container.appendChild(rightPanelResizeHandlerEl);

        createEditCellView(rightPanel);
        createSQLExecutorView(rightPanel);
        createSqlLogView(rightPanel);

        this._container.append(rightPanel);
    }

    get element() {
        return this._container;
    }
}
