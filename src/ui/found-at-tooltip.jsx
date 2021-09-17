import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Spheres from '../services/spheres';

class FoundAtTooltip extends React.PureComponent {
  render() {
    const {
      databaseLocations, locations, spheres,
    } = this.props;

    const sortedLocations = _.sortBy(
      locations,
      ({ generalLocation, detailedLocation }) => {
        const sphereForLocation = spheres.sphereForLocation(generalLocation, detailedLocation);

        return _.isNil(sphereForLocation) ? Number.MAX_SAFE_INTEGER : sphereForLocation;
      },
    );

    const locationsList = _.map(sortedLocations, ({ generalLocation, detailedLocation }) => {
      const sphere = spheres.sphereForLocation(generalLocation, detailedLocation);
      const sphereText = _.isNil(sphere) ? '?' : sphere;
      const locationName = `${generalLocation} | ${detailedLocation}`;

      return (
        <li key={locationName}>
          {`[${sphereText}] ${locationName}`}
        </li>
      );
    });

    const databaseLocationsList = _.map(databaseLocations,
      ({ authId, generalLocation, detailedLocation }) => {
        const locationName = `${authId} | ${generalLocation} - ${detailedLocation}`;
        return (
          <li key={locationName}>
            {`${locationName}`}
          </li>
        );
      });

    return (
      <div className="tooltip item-location">
        {!_.isEmpty(locationsList) && (
        <>
          <div className="tooltip-title">Locations Found At</div>
          <ul>{locationsList}</ul>
        </>
        )}

        {!_.isEmpty(databaseLocationsList) && (
        <>
          <div className="tooltip-title">Locations Found At By Others</div>
          <ul>{databaseLocationsList}</ul>
        </>
        )}

      </div>
    );
  }
}

FoundAtTooltip.propTypes = {
  databaseLocations: PropTypes.arrayOf(PropTypes.exact({
    authId: PropTypes.string.isRequired,
    generalLocation: PropTypes.string.isRequired,
    detailedLocation: PropTypes.string.isRequired,
  })).isRequired,
  locations: PropTypes.arrayOf(PropTypes.exact({
    generalLocation: PropTypes.string.isRequired,
    detailedLocation: PropTypes.string.isRequired,
  })).isRequired,
  spheres: PropTypes.instanceOf(Spheres).isRequired,
};

export default FoundAtTooltip;
