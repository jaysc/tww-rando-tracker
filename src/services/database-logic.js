import _ from 'lodash';

import Authentication from './authentication';
import Database from './database';

export default class DatabaseLogic {
  static initItems(items) {
    _.forEach(items, (value, item) => {
      this.saveItem(item, value);
    });
  }

  static saveItem(item, itemCount) {
    const key = `${Database.permaId}/${Database.gameId}/items/${item}/${Authentication.userId}`;
    const value = { itemCount };
    Database.save(key, value);
  }
}
