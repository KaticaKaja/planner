export const DB = {
    open: (version = undefined) => {
        return new Promise((resolve, reject) => {
            const indexedDB =
                window.indexedDB ||
                window.mozIndexedDB ||
                window.webkitIndexedDB ||
                window.msIndexedDB ||
                window.shimIndexedDB;
            if (!indexedDB) {
                reject(new Error('IndexedDB not supported'));
                return;
            }
            let DBOpenReq = indexedDB.open('PlannerDb', version);
            if (version) {
                resolve(DBOpenReq);
                return;
            }
            DBOpenReq.onsuccess = (ev) => {
                resolve(ev.target.result);
            }
            DBOpenReq.onerror = (err) => {
                reject(err);
            }
        });
    },
    init: async () => {
        let objectsStore = null;
        let db = null;
        try {
            let DBOpenReq = await DB.open(1);
        if (DBOpenReq) {
            DBOpenReq.onerror = (err) => {
                console.warn('error while trying to open db on init', err);
                // toast notification for trying to open db on init
            }

            DBOpenReq.onsuccess = (ev) => {
                db = ev.target.result;
                console.log('db init successful');
                db.close();
            }
            DBOpenReq.onupgradeneeded = (ev) => {
                //first time opening this DB
                //OR a new version was passed into open()
                db = ev.target.result;
                db.onerror = () => {
                    console.log('error on loading of db');
                    //toast notification
                }
                let oldVersion = ev.oldVersion;
                let newVersion = ev.newVersion || db.version;

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

                console.log('DB updated from version', oldVersion, 'to', newVersion);
                console.log('upgrade', db);
            }
        }
        } catch (error) {
            //toast notification for error on DB open
        }

    },
    add: (table, data) => {
        return new Promise(async (resolve, reject) => {
            let tx = await makeTX(table, 'readwrite');
            //if there is a necessity for a specific action on complete, move tx.oncompletete here
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
        return new Promise(async (resolve, reject) => {
            let tx = await makeTX(table, 'readonly');
            //if there is a necessity for a specific action on complete, move tx.oncompletete here
            let store = tx.objectStore(table);
            let request = store.getAll(query);
            request.onsuccess = (ev) => {
                resolve(ev.target.result);
            }
            request.onerror = (err) => {
                reject('There was an error while adding data to ' + table + ' table.');
            }
        });
    }
}

async function makeTX(storeName, mode) {
    try {
        const db = await DB.open();
        if (!db) return;
        let tx = db.transaction(storeName, mode);
        tx.oncomplete = (ev) => {
            console.info('Transaction complete: ', ev);
            tx.db.close();
        };
        tx.onerror = (err) => {
            console.warn(err.target.error);
        };
        return tx;
    } catch (error) {
        console.warn(error);
        // toast notification for failed DB open, please try later...
    }
}

export const uid = () => {
    let timmy = Date.now().toString(36).toLocaleUpperCase();
    let randy = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
    randy = randy.toString(36).slice(0, 12).padStart(12, '0').toLocaleUpperCase();
    return ''.concat(timmy, '-', randy);
};
