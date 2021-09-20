import _ from 'lodash';

import Authentication from './authentication';
import Database from './database';
import LogicHelper from './logic-helper';

export default class DatabaseLogic {
  static gamePath = () => `games/${Database.permaId}/${Database.gameId}`;

  static init() {
    Database.update(`${this.gamePath()}/metadata`, {
      timestamp: Date.now(),
      ownerId: Authentication.userId,
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
      const key = `${this.gamePath()}/items/${item}`;
      Database.onChildAdded(key, itemCallback);
      Database.onChildChanged(key, itemCallback);
    });
  }

  static initSubscribeLocations(trackerState, updateDatabaseState) {
    _.forEach(trackerState.locationsChecked, (detailedLocations, generalLocation) => {
      _.forEach(detailedLocations, (value, detailedLocation) => {
        const locationCallback = (snapshot) => {
          console.log('location callback');
          console.log(`${generalLocation} - ${detailedLocation}`);
          console.log(snapshot.key);
          const newData = snapshot.val();
          console.log(newData);
          updateDatabaseState(_.set({}, ['locations', generalLocation, detailedLocation, snapshot.key], newData));
        };

        const key = `${this.gamePath()}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}`;
        Database.onChildAdded(key, locationCallback);
        Database.onChildChanged(key, locationCallback);
      });
    });
  }

  static initSubscribeSphere(trackerState, updateDatabaseState) {
    _.forEach(trackerState.locationsChecked, (detailedLocations, generalLocation) => {
      _.forEach(detailedLocations, (value, detailedLocation) => {
        const key = `${this.gamePath()}/spheres/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}`;
        const callback = (snapshot) => {
          console.log('sphere callback');
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

  static resolveDatabaseItems(newData, trackerState) {
    const items = {};
    _.forEach(_.get(newData, 'items'), (itemValue, itemName) => {
      _.forEach(itemValue, (value, authId) => {
        if (authId === Authentication.userId) {
          _.set(items, itemName, value.itemCount);
        }
      });
    });
    _.merge(trackerState.items, items);
  }

  static resolveDatabaseLocations(newData, trackerState) {
    const locationsChecked = {};
    const itemsForLocations = {};
    _.forEach(_.get(newData, 'locations'), (detailedLocationList, generalLocation) => {
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
    const itemCount = trackerState.getItemValue(itemName);
    const key = `${this.gamePath()}/items/${itemName}/${Authentication.userId}`;
    Database.save(key, { itemCount });
  }

  static saveLocation(generalLocation, detailedLocation, isChecked) {
    const key = `${this.gamePath()}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
    const value = { isChecked };
    Database.save(key, value);
  }

  static saveItemsForLocations(generalLocation, detailedLocation, itemName) {
    const key = `${this.gamePath()}/locations/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
    Database.update(key, { itemName });
  }

  static saveSphere(generalLocation, detailedLocation, sphere, databaseState) {
    if (sphere !== 0 && LogicHelper.isProgressLocation(generalLocation, detailedLocation)) {
      const oldSphere = _.get(databaseState, ['spheres', generalLocation, detailedLocation, Authentication.userId]);
      if (!oldSphere || oldSphere !== sphere) {
        const key = `${this.gamePath()}/spheres/${generalLocation}/${DatabaseLogic.formatLocationName(detailedLocation)}/${Authentication.userId}`;
        Database.save(key, { sphere });
      }
    }
  }
}
