import {
  getDatabase, ref, set, connectDatabaseEmulator, onChildAdded, onChildChanged, onChildRemoved, onValue, update,
} from 'firebase/database';

export default class Database {
  static async initialize(isLocal, permaId, gameId) {
    return new Promise((resolve, reject) => {
      if (isLocal) {
        this.db = getDatabase();
        console.log('Using Emulator');
        connectDatabaseEmulator(this.db, 'localhost', 9000);
      } else {
        this.db = getDatabase();
      }

      this.permaId = permaId;
      this.gameId = gameId;
      this.enabled = true;
      resolve();
    });
  }

  static onChildChanged(key, callback) {
    const keyRef = ref(this.db, key);
    onChildChanged(keyRef, callback);
  }

  static onChildAdded(key, callback) {
    const keyRef = ref(this.db, key);
    onChildAdded(keyRef, callback);
  }

  static onValue(key, callback) {
    const keyRef = ref(this.db, key);
    onValue(keyRef, callback);
  }

  static onChildRemoved(key, callback) {
    const keyRef = ref(this.db, key);
    onChildRemoved(keyRef, callback);
  }

  static save(key, value) {
    if (this.db) {
      console.log(`Database save key: ${key}`);
      console.log(`Database save value: ${value}`);
      set(ref(this.db, key), value);
    }
  }

  static update(key, value) {
    if (this.db) {
      console.log(`Database update key: ${key}`);
      console.log(`Database update value: ${value}`);
      update(ref(this.db, key), value);
    }
  }
}