import {
  getDatabase, ref, set, useDatabaseEmulator, onValue,
} from 'firebase/database';

export default class Database {
  static async saveAsync(key, saveData) {
    console.log(`Saving ${key}`);
    console.log(saveData);
    set(ref(Database.db, key), saveData);
  }

  static subscribe(key, callback) {
    return onValue(ref(Database.db, key), (snapshot) => {
      if (callback) {
        callback(snapshot.val());
      }
    });
  }

  static async initialize(isLocal) {
    if (isLocal) {
      this.db = getDatabase();
      console.log('Using Emulator');
      useDatabaseEmulator(this.db, 'localhost', 9000);
    } else {
      this.db = getDatabase();
    }
  }
}
