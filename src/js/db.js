export const DB = {
    init: () => {
        const indexedDB =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB ||
            window.shimIndexedDB;
        let db = null;
        let objectsStore = null;
        let DBOpenReq = indexedDB.open('PlannerDb', 1);
        if (DBOpenReq) {
            DBOpenReq.addEventListener('error', (err) => {
                console.warn('error while trying to open db', err);
            });

            DBOpenReq.addEventListener('success', (ev) => {
                db = ev.target.result;
                console.log('success');
            });

            DBOpenReq.addEventListener('upgradeneeded', (ev) => {
                //first time opening this DB
                //OR a new version was passed into open()
                db = ev.target.result;
                let oldVersion = ev.oldVersion;
                let newVersion = ev.newVersion || db.version;
                console.log('DB updated from version', oldVersion, 'to', newVersion);

                console.log('upgrade', db);
                if (!db.objectStoreNames.contains('users')) {
                objectsStore = db.createObjectStore('users', {
                    keyPath: 'id',
                });
                }
                // db.deleteObjectStore('foobar');

            });
        }
        // let tx = makeTX('users', 'readwrite');

        // tx.oncomplete = (ev) => {
        //     console.log(ev);
        //     //buildList()
        // };
    }
}

export function makeTX(storeName, mode) {
    if (!db) return;
    let tx = db.transaction(storeName, mode);
    tx.onerror = (err) => {
      console.warn(err);
    };
    return tx;
}

export const uid = () => {
    let timmy = Date.now().toString(36).toLocaleUpperCase();
    let randy = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
    randy = randy.toString(36).slice(0, 12).padStart(12, '0').toLocaleUpperCase();
    return ''.concat(timmy, '-', randy);
};
