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
    let handle: FileSystemFileHandle | undefined;
    try {
        [handle] = await window.showOpenFilePicker();
    } catch {
        return;
    }
    if (!handle) {
        return;
    }

    const root = await navigator.storage.getDirectory();

    const targetFile = await root.getFileHandle(handle.name, {
        create: true,
    });

    const file = await handle.getFile();

    const writable = await targetFile.createWritable();

    writable.write(await file.arrayBuffer());

    writable.close();
};

const showViewerBtn = document.getElementById(
    'show_viewer_btn'
) as HTMLButtonElement;

showViewerBtn.onclick = () => {
    showViewer();
};
