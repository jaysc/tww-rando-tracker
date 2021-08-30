import Authentication from './authentication';
import Database from './database';

export default class DatabaseLogic {
  static async saveGame(databaseData) {
    const key = `games/${databaseData.perma}/${databaseData.gameId}/${Authentication.userId}`;
    Database.saveAsync(key, databaseData.readState()).then(() => console.log('saved'));
  }

  static async saveCoopGame(databaseData) {
    const key = `games/${databaseData.perma}/${databaseData.gameId}/coop`;
    Database.saveAsync(key, databaseData.readState()).then(() => console.log('saved'));
  }

  static loadUserGame(databaseData, callback) {
    const key = `games/${databaseData.perma}/${databaseData.gameId}/${Authentication.userId}`;
    console.log(`Loading:${key}`);
    this.subscription = Database.subscribe(key, callback);
  }

  static loadGame(databaseData, callback) {
    const key = `games/${databaseData.perma}/${databaseData.gameId}`;
    this.subscription = Database.subscribe(key, callback);
  }

  static loadCoopGame(databaseData, callback) {
    const key = `games/${databaseData.perma}/${databaseData.gameId}/coop`;
    this.subscription = Database.subscribe(key, callback);
  }

  static saveItem(perma, id, item) {
    const key = `games/${perma}/${id}/items`;
    Database.saveAsync(key, item).then(() => console.log('saved'));
  }

  static saveLocationChecked(perma, id, generalLocation, detailedLocation) {
    const key = `games/${perma}/${id}/locationsChecked/${generalLocation}/${detailedLocation}`;
    Database.saveAsync(key, true).then(() => console.log('saved'));
  }

  static saveLocationUnChecked(perma, id, generalLocation, detailedLocation) {
    const key = `games/${perma}/${id}/locationsChecked/${generalLocation}/${detailedLocation}`;
    Database.saveAsync(key, null).then(() => console.log('saved'));
  }
}
