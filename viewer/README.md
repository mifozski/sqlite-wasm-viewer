# SQLite Wasm Viewer

A simple web-based SQLite browser that lets you inspect SQLite databases created by the [SQLite Wasm module](https://github.com/sqlite/sqlite-wasm) and stored in OPFS storage. It also supports running queries and filtering tables.

![Viewer](screenshot.png)

# Installation
```
npm install --save sqlite-wasm-viewer
```

or 

```
yarn add sqlite-wasm-viewer
```

# Usage
To open the viewer:
```js
import { showViewer } from 'sqlite-wasm-viewer';

showViewer();
```

By default, only files ending with '.db' or '.sqlite' are recognized as SQLite databases, but you can modify this behavior as follows:
```js
import { showViewer, setConfig } from 'sqlite-wasm-viewer';

setConfig({
  isSqliteDatabase: databaseName => {
    // return true if databaseName is an SQLite db
  },
});

showViewer();
```

# Development
Run:
```
yarn start
```
to start the testing app at `http://localhost:9000`