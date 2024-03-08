let db = null;
export const DB = {
    init: () => {
        const indexedDB =
            window.indexedDB ||
            window.mozIndexedDB ||
            window.webkitIndexedDB ||
            window.msIndexedDB ||
            window.shimIndexedDB;
        let objectsStore = null;
        let DBOpenReq = indexedDB.open('PlannerDb', 4);
        if (DBOpenReq) {
            DBOpenReq.onerror = (err) => {
                console.warn('error while trying to open db', err);
            }

            DBOpenReq.onsuccess = (ev) => {
                db = ev.target.result;
                console.log('success');
            }
            DBOpenReq.onupgradeneeded = (ev) => {
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
                if (!db.objectStoreNames.contains('notes')) {
                    objectsStore = db.createObjectStore('notes', {
                        keyPath: 'id',
                    });
                }
                if (!db.objectStoreNames.contains('todos')) {
                    objectsStore = db.createObjectStore('todos', {
                        keyPath: 'id',
                    });
                }
                if (!db.objectStoreNames.contains('events')) {
                    objectsStore = db.createObjectStore('events', {
                        keyPath: 'id',
                    });
                }
                console.log('on upgrade finished')
            }
        }
    },
    add: (table, data) => {
        return new Promise((resolve, reject) => {
            let tx = makeTX(table, 'readwrite');

            tx.oncomplete = (ev) => {
                console.info(ev);
            };
            let store = tx.objectStore(table);
            let request = store.add(data);

            request.onsuccess = (ev) => {
                resolve(ev);
            };

            request.onerror = (err) => {
                reject('There was an error while adding data to ' + table + ' table.');
            }
        });
    },
    getAll: (table, query = undefined) => {
        return new Promise((resolve, reject) => {
            let tx = makeTX(table, 'readonly');

            tx.oncomplete = (ev) => {
                console.info(ev);
            };
            let store = tx.objectStore(table);
            let request = store.getAll(query);
            let result = [];
            request.onsuccess = (ev) => {
                resolve(ev.target.result);
            }
            request.onerror = (err) => {
                reject('There was an error while adding data to ' + table + ' table.');
            }
            return result;
        });
    }
}

function makeTX(storeName, mode) {
    if (!db) return;
    let tx = db.transaction(storeName, mode);
    tx.onerror = (err) => {
      console.warn(err.target.error);
    };
    return tx;
}

export const uid = () => {
    let timmy = Date.now().toString(36).toLocaleUpperCase();
    let randy = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
    randy = randy.toString(36).slice(0, 12).padStart(12, '0').toLocaleUpperCase();
    return ''.concat(timmy, '-', randy);
};
