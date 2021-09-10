import {
  getDatabase, ref, set, connectDatabaseEmulator, onChildAdded, onChildChanged, get,
} from 'firebase/database';

export default class Database {
  static async initialize(isLocal, permaId, gameId) {
    if (isLocal) {
      this.db = getDatabase();
      console.log('Using Emulator');
      connectDatabaseEmulator(this.db, 'localhost', 9000);
    } else {
      this.db = getDatabase();
    }

    this.permaId = permaId;
    this.gameId = gameId;
  }

  static onChildChanged(key, callback) {
    const itemRef = ref(this.db, key);
    onChildChanged(itemRef, callback);
  }

  static onChildAdded(key, callback) {
    const itemRef = ref(this.db, key);
    onChildAdded(itemRef, callback);
  }

  static save(key, value) {
    console.log(`Database save key: ${key}`);
    console.log(`Database save value: ${value}`);
    set(ref(this.db, key), value);
  }

  static async get(key) {
    return get(ref(this.db, key));
  }
}
