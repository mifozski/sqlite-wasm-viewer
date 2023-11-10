type Config = {
    isSqliteDatabase: (fileName: string) => boolean;
};

export declare function setConfig(userConfig?: Partial<Config>): void;
export declare function defaultIsSqliteDatabase(filename: string): boolean;
export declare function showViewer(): void;
export declare function hideViewer(): void;
