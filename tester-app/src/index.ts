import {
    showViewer,
    setConfig,
    defaultIsSqliteDatabase,
} from 'sqlite-wasm-viewer';
import sampleDbUrl from '../chinook.sqlite';

setConfig({
    isSqliteDatabase: (filename) => {
        if (filename.endsWith('exb')) {
            return true;
        }

        return defaultIsSqliteDatabase(filename);
    },
});

async function saveDatabaseToOpfs(
    filename: string,
    data: ArrayBuffer
): Promise<void> {
    const root = await navigator.storage.getDirectory();
    const sanitizedFilename = filename.trim().replaceAll(' ', '_');
    const targetFile = await root.getFileHandle(sanitizedFilename, {
        create: true,
    });
    const writable = await targetFile.createWritable();

    await writable.write(data);
    await writable.close();
}

const importDbBtn = document.getElementById(
    'import_db_btn'
) as HTMLButtonElement;

importDbBtn.onclick = async () => {
    document.getElementById('file_input')!.click();
};

document
    .getElementById('file_input')!
    .addEventListener('change', async (event) => {
        const { files } = event.target as HTMLInputElement;
        const file = files![0];
        if (!file) {
            return;
        }

        await saveDatabaseToOpfs(file.name, await file.arrayBuffer());
    });

async function downloadWithProgress(
    url: string,
    onProgress: (loaded: number, total: number | null) => void
): Promise<ArrayBuffer> {
    const response = await fetch(url);
    if (!response.ok) {
        throw new Error(
            `Failed to download sample database (${response.status})`
        );
    }

    const contentLength = response.headers.get('Content-Length');
    const total = contentLength ? Number(contentLength) : null;

    if (!response.body) {
        const data = await response.arrayBuffer();
        onProgress(data.byteLength, data.byteLength);
        return data;
    }

    const reader = response.body.getReader();
    const chunks: Uint8Array[] = [];
    let loaded = 0;

    const readChunk = async (): Promise<void> => {
        const { done, value } = await reader.read();
        if (done) {
            return;
        }

        if (value) {
            chunks.push(value);
            loaded += value.byteLength;
            onProgress(loaded, total);
        }

        await readChunk();
    };

    await readChunk();

    const bytes = new Uint8Array(loaded);
    let offset = 0;
    chunks.forEach((chunk) => {
        bytes.set(chunk, offset);
        offset += chunk.byteLength;
    });

    return bytes.buffer;
}

const loadSampleDbBtn = document.getElementById(
    'load_sample_db_btn'
) as HTMLButtonElement;
const sampleProgressWrap = document.getElementById(
    'sample_db_progress_wrap'
) as HTMLElement;
const sampleProgress = document.getElementById(
    'sample_db_progress'
) as HTMLProgressElement;
const sampleStatus = document.getElementById('sample_db_status') as HTMLElement;

loadSampleDbBtn.onclick = async () => {
    loadSampleDbBtn.disabled = true;
    sampleProgressWrap.hidden = false;
    sampleProgress.removeAttribute('value');
    sampleStatus.textContent = 'Downloading…';

    try {
        const data = await downloadWithProgress(
            sampleDbUrl,
            (loaded, total) => {
                if (!total) {
                    sampleStatus.textContent = `${Math.round(
                        loaded / 1024
                    )} KB`;
                    return;
                }

                sampleProgress.max = total;
                sampleProgress.value = loaded;
                sampleStatus.textContent = `${Math.round(
                    (loaded / total) * 100
                )}%`;
            }
        );

        sampleStatus.textContent = 'Saving…';
        await saveDatabaseToOpfs('chinook.sqlite', data);
        sampleProgress.max = 100;
        sampleProgress.value = 100;
        sampleStatus.textContent = 'Saved';
    } catch (error) {
        sampleStatus.textContent = 'Download failed';
        throw error;
    } finally {
        loadSampleDbBtn.disabled = false;
    }
};

const showViewerBtn = document.getElementById(
    'show_viewer_btn'
) as HTMLButtonElement;

showViewerBtn.onclick = () => {
    showViewer();
};
