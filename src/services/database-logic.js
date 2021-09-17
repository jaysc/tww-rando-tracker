import _ from 'lodash';

import Authentication from './authentication';
import Database from './database';
import LogicHelper from './logic-helper';

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
        updateDatabaseState(_.set({}, ['items', item, snapshot.key], newData));
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
          updateDatabaseState(_.set({}, ['locations', generalLocation, detailedLocation, snapshot.key], newData));
        };

        const key = `${Database.permaId}/${Database.gameId}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}`;
        Database.onChildAdded(key, locationCallback);
        Database.onChildChanged(key, locationCallback);
      });
    });
  }

  static initSubscribeSphere(trackerState, updateDatabaseState) {
    _.forEach(trackerState.locationsChecked, (detailedLocations, generalLocation) => {
      _.forEach(detailedLocations, (value, detailedLocation) => {
        const key = `${Database.permaId}/${Database.gameId}/spheres/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}`;
        const callback = (snapshot) => {
          console.log(`Sphere - ${generalLocation} - ${detailedLocation}`);
          console.log(snapshot.key);
          const newData = snapshot.val();
          console.log(newData);
          updateDatabaseState(_.set({}, ['spheres', generalLocation, detailedLocation, snapshot.key], newData));
        };
        Database.onChildAdded(key, callback);
        Database.onChildChanged(key, callback);
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
    const itemsForLocations = {};
    _.forEach(_.get(databaseState, 'locations'), (detailedLocationList, generalLocation) => {
      _.forEach(detailedLocationList, (detailedLocationListValue, detailedLocation) => {
        _.forEach(detailedLocationListValue, (value, authId) => {
          if (authId === Authentication.userId) {
            console.log(value);
            _.set(locationsChecked,
              [generalLocation, this.unFormatLocationName(detailedLocation)], value.isChecked);
            _.set(itemsForLocations,
              [generalLocation, this.unFormatLocationName(detailedLocation)], value.itemName);
          }
        });
      });
    });
    _.merge(trackerState.locationsChecked, locationsChecked);
    _.merge(trackerState.itemsForLocations, itemsForLocations);
  }

  static resolveSpheres(newData, newSpheres) {
    const spheres = {};
    _.forEach(_.get(newData, 'spheres'), (detailedLocationList, generalLocation) => {
      _.forEach(detailedLocationList, (detailedLocationListValue, detailedLocation) => {
        _.forEach(detailedLocationListValue, (value, authId) => {
          if (authId === Authentication.userId) {
            _.set(spheres, ['spheres', generalLocation, this.unFormatLocationName(detailedLocation)], value.sphere);
          }
        });
      });
    });
    _.merge(newSpheres, spheres);
  }

  static formatLocationName(locationName) {
    return locationName.replace('.', '~');
  }

  static unFormatLocationName(locationName) {
    return locationName.replace('~', '.');
  }

  static saveItem(trackerState, itemName) {
    let itemCount = trackerState.getItemValue(itemName);
    itemCount = itemCount !== 0 ? itemCount : null;
    const key = `${Database.permaId}/${Database.gameId}/items/${itemName}/${Authentication.userId}`;
    Database.save(key, { itemCount });
  }

  static saveLocation(generalLocation, detailedLocation, isChecked) {
    const key = `${Database.permaId}/${Database.gameId}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
    const value = { isChecked };
    Database.save(key, value);
  }

  static saveItemsForLocations(generalLocation, detailedLocation, itemName) {
    const key = `${Database.permaId}/${Database.gameId}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
    Database.update(key, { itemName });
  }

  static saveSphere(generalLocation, detailedLocation, sphere) {
    if (sphere !== 0 && LogicHelper.isProgressLocation(generalLocation, detailedLocation)) {
      const key = `${Database.permaId}/${Database.gameId}/spheres/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
      Database.save(key, { sphere });
    }
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

  static otherUsersItem(databaseState, itemName) {
    const result = [];
    _.forEach(_.get(databaseState, 'locations'), (detailedLocationList, generalLocation) => {
      _.forEach(detailedLocationList, (detailedLocationListValue, detailedLocation) => {
        _.forEach(detailedLocationListValue, (value, authId) => {
          if (authId !== Authentication.userId
            && _.get(value, 'itemName') === itemName
            && _.get(value, 'isChecked')) {
            result.push(`${authId} - ${generalLocation} | ${detailedLocation}`);
          }
        });
      });
    });
    return result;
  }

  static otherUsersItemForLocation(databaseState, generalLocation, detailedLocation) {
    const result = [];

    const detailedLocationValue = _.get(databaseState, ['locations', generalLocation, detailedLocation]);
    _.forEach(detailedLocationValue, (value, authId) => {
      if (authId !== Authentication.userId
        && _.get(value, 'itemName')
        && _.get(value, 'isChecked')) {
        result.push(`${authId} - ${_.get(value, 'itemName')}`);
      }
    });

    return result;
  }

  static getOtherUsersLocationsForItem(databaseState, itemName) {
    const locations = [];
    _.forEach(_.get(databaseState, 'locations'), (detailedLocationList, generalLocation) => {
      _.forEach(detailedLocationList, (detailedLocationListValue, detailedLocation) => {
        _.forEach(detailedLocationListValue, (value, authId) => {
          if (authId !== Authentication.userId
            && _.get(value, 'itemName') === itemName
            && _.get(value, 'isChecked')) {
            locations.push({ authId, generalLocation, detailedLocation });
          }
        });
      });
    });
    return locations;
  }
}
