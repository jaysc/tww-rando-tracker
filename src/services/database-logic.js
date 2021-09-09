import _ from 'lodash';

import Authentication from './authentication';
import Database from './database';

export default class DatabaseLogic {
  static initItems(items) {
    _.forEach(items, (value, item) => {
      this.saveItem(item, value);
    });
  }

  static initSubscribeItems(databaseState, trackerState, updateDatabaseState) {
    _.forEach(trackerState.items, (value, item) => {
      const itemCallback = (snapshot) => {
        const newDatabaseState = _.cloneDeep(databaseState);
        console.log(item);
        console.log(snapshot.key);
        console.log(snapshot.val());
        _.set(newDatabaseState, ['items', item, snapshot.key], snapshot.val());
        updateDatabaseState(newDatabaseState);
      };

      const key = `${Database.permaId}/${Database.gameId}/items/${item}`;
      Database.onChildChanged(key, itemCallback);
    });
  }

  static initSubscribeLocations(databaseState, trackerState, updateDatabaseState) {
    _.forEach(trackerState.locationsChecked, (detailedLocations, generalLocation) => {
      _.forEach(detailedLocations, (value, detailedLocation) => {
        const locationCallback = (snapshot) => {
          const newDatabaseState = _.cloneDeep(databaseState);
          console.log(`${generalLocation} - ${detailedLocation}`);
          console.log(snapshot.key);
          console.log(snapshot.val());
          _.set(newDatabaseState, ['locations', generalLocation, detailedLocation, snapshot.key], snapshot.val());
          updateDatabaseState(newDatabaseState);
        };

        const key = `${Database.permaId}/${Database.gameId}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}`;
        Database.onChildChanged(key, locationCallback);
      });
    });
  }

  static formatLocationName(locationName) {
    return locationName.replace('.', '');
  }

  static saveItem(item, itemCount) {
    const key = `${Database.permaId}/${Database.gameId}/items/${item}/${Authentication.userId}`;
    const value = { itemCount };
    Database.save(key, value);
  }

  static saveLocation(generalLocation, detailedLocation, isChecked) {
    const key = `${Database.permaId}/${Database.gameId}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
    const value = { isChecked };
    Database.save(key, value);
  }

  static coopFound(databaseState, openedLocation, location) {
    const databaseStateLocation = _.get(databaseState, ['locations', openedLocation, location]);
    let coopLocation = '';
    if (databaseStateLocation
      && _.some(databaseStateLocation,
        (value, authId) => authId !== Authentication.userId && value.isChecked)) {
      coopLocation = 'coop-found';
    }
    return coopLocation;
  }
}
