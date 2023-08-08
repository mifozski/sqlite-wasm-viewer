import { DbWorkerOutput } from './types';

let uiReady = false;

let viewer: HTMLDivElement | null = null;

let dbListEl: HTMLDivElement | null = null;

export function showViewer(): void {
    if (!uiReady) {
        viewer = document.createElement('div');

        viewer.style.position = 'absolute';
        viewer.style.width = '100%';
        viewer.style.height = '100%';
        viewer.style.backgroundColor = 'red';
        viewer.style.display = 'flex';

        dbListEl = document.createElement('div');
        dbListEl.style.width = '200px';
        dbListEl.innerText = 'Database List';

        viewer.appendChild(dbListEl);

        const worker = new Worker(new URL('DbWorker.ts', import.meta.url), {
            type: 'module',
        });

        worker.onmessage = (message: MessageEvent<DbWorkerOutput>): void => {
            console.log('message:', message.data);
            dbListEl.innerHTML = '';
            if (message.data.type === 'onReady') {
                message.data.dbs.forEach((db) => {
                    const dbEl = document.createElement('div');
                    dbEl.innerText = db;

                    dbEl.onclick = () => {
                        worker.postMessage({ type: 'readSchema', path: db });
                    };

                    dbListEl.appendChild(dbEl);
                });
            } else if (message.data.type === 'onSchema') {
                console.log('schema:', message.data.schema);
            }
        };

        worker.postMessage({ type: 'init' });

        uiReady = true;
    }

    document.body.appendChild(viewer);
}

export function hideViewer(): void {
    document.body.removeChild(viewer);
}
