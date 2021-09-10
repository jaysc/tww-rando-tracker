import _ from 'lodash';

import Authentication from './authentication';
import Database from './database';

export default class DatabaseLogic {
  static initItems(items) {
    _.forEach(items, (value, item) => {
      this.saveItem(item, value);
    });
  }

  static initSubscribeItems(trackerState, updateDatabaseState) {
    _.forEach(trackerState.items, (value, item) => {
      const itemCallback = (snapshot) => {
        console.log('item callback');
        console.log(item);
        console.log(snapshot.key);
        const newData = snapshot.val();
        console.log(newData);
        updateDatabaseState(_.set({}, ['items', item, snapshot.key], snapshot.val()));
      };

      const key = `${Database.permaId}/${Database.gameId}/items/${item}`;
      Database.onChildAdded(key, itemCallback);
      Database.onChildChanged(key, itemCallback);
    });
  }

  static initSubscribeLocations(trackerState, updateDatabaseState) {
    _.forEach(trackerState.locationsChecked, (detailedLocations, generalLocation) => {
      _.forEach(detailedLocations, (value, detailedLocation) => {
        const locationCallback = (snapshot) => {
          console.log(`${generalLocation} - ${detailedLocation}`);
          console.log(snapshot.key);
          const newData = snapshot.val();
          console.log(newData);
          updateDatabaseState(_.set({}, ['locations', generalLocation, detailedLocation, snapshot.key], snapshot.val()));
        };

        const key = `${Database.permaId}/${Database.gameId}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}`;
        Database.onChildAdded(key, locationCallback);
        Database.onChildChanged(key, locationCallback);
      });
    });
  }

  static async initLoad(updateDatabaseState) {
    const key = `${Database.permaId}/${Database.gameId}`;
    return new Promise((resolve) => {
      Database.get(key).then((snapshot) => {
        console.log('Loading data');
        const latestData = snapshot.val();
        console.log(latestData);
        if (latestData) {
          updateDatabaseState(latestData);
          resolve(latestData);
        } else {
          resolve({});
        }
      });
    });
  }

  static resolveDatabaseItems(databaseState, trackerState) {
    const items = {};
    _.forEach(_.get(databaseState, 'items'), (itemValue, itemName) => {
      _.forEach(itemValue, (value, authId) => {
        if (authId === Authentication.userId) {
          _.set(items, itemName, value.itemCount);
        }
      });
    });
    _.merge(trackerState.items, items);
  }

  static resolveDatabaseLocations(databaseState, trackerState) {
    const locationsChecked = {};
    _.forEach(_.get(databaseState, 'locations'), (detailedLocationList, generalLocation) => {
      _.forEach(detailedLocationList, (detailedLocationListValue, detailedLocation) => {
        _.forEach(detailedLocationListValue, (value, authId) => {
          if (authId === Authentication.userId) {
            _.set(locationsChecked, [generalLocation, this.unFormatLocationName(detailedLocation)], value.isChecked);
          }
        });
      });
    });
    _.merge(trackerState.locationsChecked, locationsChecked);
  }

  static formatLocationName(locationName) {
    return locationName.replace('.', '~');
  }

  static unFormatLocationName(locationName) {
    return locationName.replace('~', '.');
  }

  static saveItem(trackerState, itemName, generalLocation, detailedLocation, isChecked) {
    const itemCount = trackerState.getItemValue(itemName);
    const key = `${Database.permaId}/${Database.gameId}/items/${itemName}/${Authentication.userId}`;
    const value = { itemCount, locations: _.set({}, [generalLocation, this.formatLocationName(detailedLocation), 'isChecked'], isChecked) };
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
