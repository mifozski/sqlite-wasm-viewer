import './styles.css';

import { Viewer } from './viewer';

let _viewer: Viewer | undefined;

export type Config = {
    isSqliteDatabase: (fileName: string) => boolean;
};

const defaultSqliteExtension = ['db', 'sqlite'];

export function defaultIsSqliteDatabase(filename: string): boolean {
    return defaultSqliteExtension.some((ext) => filename.endsWith(`.${ext}`));
}

const config: Config = {
    isSqliteDatabase: defaultIsSqliteDatabase,
};

export function setConfig(userConfig?: Partial<Config>) {
    if (userConfig) {
        Object.assign(config, userConfig);
    }
    Object.freeze(config);
}

export function showViewer(): void {
    if (!_viewer) {
        _viewer = new Viewer(config, () => {
            hideViewer();
        });
    }

    document.body.appendChild(_viewer.element);
}

export function hideViewer(): void {
    if (_viewer) {
        document.body.removeChild(_viewer.element);
    }
}
