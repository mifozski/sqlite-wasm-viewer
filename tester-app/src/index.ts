import {
    showViewer,
    setConfig,
    defaultIsSqliteDatabase,
} from 'sqlite-wasm-viewer';

setConfig({
    isSqliteDatabase: (filename) => {
        if (filename.endsWith('exb')) {
            return true;
        }

        return defaultIsSqliteDatabase(filename);
    },
});

const importDbBtn = document.getElementById(
    'import_db_btn'
) as HTMLButtonElement;

importDbBtn.onclick = async () => {
    document.getElementById('file_input').click();
};

document
    .getElementById('file_input')
    .addEventListener('change', async (event) => {
        const { files } = event.target as HTMLInputElement;
        const file = files[0];
        if (!file) {
            return;
        }

        const root = await navigator.storage.getDirectory();

        const sanitizedFilename = file.name.trim().replaceAll(' ', '_');
        const targetFile = await root.getFileHandle(sanitizedFilename, {
            create: true,
        });

        const writable = await targetFile.createWritable();

        writable.write(await file.arrayBuffer());

        writable.close();
    });

const showViewerBtn = document.getElementById(
    'show_viewer_btn'
) as HTMLButtonElement;

showViewerBtn.onclick = () => {
    showViewer();
};
