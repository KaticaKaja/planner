export const DB = {
    open: (username = undefined, version = undefined) => {
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
            let DBOpenReq = indexedDB.open(username ? `userDB_${username}` : 'PlannerDb', version);
            if (version) {
                resolve(DBOpenReq);
                return;
            }
            DBOpenReq.onsuccess = (event) => {
                resolve(event.target.result);

            }
            DBOpenReq.onerror = (event) => {
                reject(event.target.error);
            }
        });
    },
    init: async (username = undefined) => {
        let objectsStore = null;
        let db = null;
        try {
            let DBOpenReq = await DB.open(username, 1);
        if (DBOpenReq) {
            DBOpenReq.onerror = (event) => {
                console.error(`Error opening database ${username ? ('for user ' + username) : 'PlannerDb'}: `, event.target.error);
            }

            DBOpenReq.onsuccess = (ev) => {
                db = ev.target.result;
                console.log(`Database ${username ? ('for user ' + username) : 'PlannerDb'} opened successfully`);
                db.close();
            }
            DBOpenReq.onupgradeneeded = (ev) => {
                //first time opening this DB
                //OR a new version was passed into open()
                db = ev.target.result;
                db.onerror = () => {
                    console.error('error on loading of db');
                }
                let oldVersion = ev.oldVersion;
                let newVersion = ev.newVersion || db.version;

                if (!username) {
                    if (!db.objectStoreNames.contains('users')) {
                        objectsStore = db.createObjectStore('users', {
                            keyPath: 'id',
                        });
                    }
                }
                else {
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
                    if (!db.objectStoreNames.contains('budget')) {
                        objectsStore = db.createObjectStore('budget', {
                            keyPath: 'id',
                        });
                    }
                    if (!db.objectStoreNames.contains('expense_categories')) {
                        objectsStore = db.createObjectStore('expense_categories', {
                            keyPath: 'id',
                        });
                    }
                    if (!db.objectStoreNames.contains('income')) {
                        objectsStore = db.createObjectStore('income', {
                            keyPath: 'id',
                        });
                    }
                    if (!db.objectStoreNames.contains('expenses')) {
                        objectsStore = db.createObjectStore('expenses', {
                            keyPath: 'id',
                        });
                    }
                }

                console.log('DB updated from version', oldVersion, 'to', newVersion);
                console.log('upgrade', db);
            }
        }
        } catch (error) {
            console.error(error);
        }

    },
    add: (table, data, username = undefined) => {
        return new Promise(async (resolve, reject) => {
            let tx = await makeTX(username, table, 'readwrite');
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
    getAll: (table, query = undefined, username = undefined) => {
        return new Promise(async (resolve, reject) => {
            let tx = await makeTX(username, table, 'readonly');
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

async function makeTX(username, storeName, mode) {
    try {
        const db = await DB.open(username);
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
    }
}

export const uid = () => {
    let timmy = Date.now().toString(36).toLocaleUpperCase();
    let randy = parseInt(Math.random() * Number.MAX_SAFE_INTEGER);
    randy = randy.toString(36).slice(0, 12).padStart(12, '0').toLocaleUpperCase();
    return ''.concat(timmy, '-', randy);
};
