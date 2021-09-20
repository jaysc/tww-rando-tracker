import _ from 'lodash';

import Authentication from './authentication';

export default class DatabaseState {
  coopFound(openedLocation, location) {
    const databaseStateLocation = _.get(this, ['locations', openedLocation, location]);
    let coopLocation = '';
    if (databaseStateLocation
      && _.some(databaseStateLocation,
        (value, authId) => authId !== Authentication.userId && value.isChecked)) {
      coopLocation = 'coop-found';
    }
    return coopLocation;
  }

  otherUsersItem(itemName) {
    const result = [];
    _.forEach(_.get(this, 'locations'), (detailedLocationList, generalLocation) => {
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

  otherUsersItemForLocation(generalLocation, detailedLocation) {
    const result = [];

    const detailedLocationValue = _.get(this, ['locations', generalLocation, detailedLocation]);
    _.forEach(detailedLocationValue, (value, authId) => {
      if (authId !== Authentication.userId
        && _.get(value, 'itemName')
        && _.get(value, 'isChecked')) {
        result.push(`${authId} - ${_.get(value, 'itemName')}`);
      }
    });

    return result;
  }

  otherUsersLocationsForItem(itemName) {
    const locations = [];

    if (_.get(this, ['items', itemName])) {
      const itemFoundForUser = {};

      _.forEach(_.get(this, 'locations'), (detailedLocationList, generalLocation) => {
        _.forEach(detailedLocationList, (detailedLocationListValue, detailedLocation) => {
          _.forEach(detailedLocationListValue, (value, authId) => {
            if (authId !== Authentication.userId
              && _.get(value, 'itemName') === itemName
              && _.get(value, 'isChecked')) {
              locations.push({ authId, generalLocation, detailedLocation });
              _.set(itemFoundForUser, authId, true);
            }
          });
        });
      });

      _.forEach(_.get(this, ['items', itemName]), (value, authId) => {
        if (authId !== Authentication.userId && !_.get(itemFoundForUser, authId)) {
          locations.push({ authId, generalLocation: 'Unknown', detailedLocation: 'location' });
        }
      });
    }

    return locations;
  }
}
