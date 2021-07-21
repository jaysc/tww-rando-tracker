import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import Spheres from '../services/spheres';

class FoundAtTooltip extends React.PureComponent {
  render() {
    const { locations } = this.props;

    const locationsList = _.map(locations, (
      { generalLocation, detailedLocation, sphere },
    ) => (
      <li key={`${generalLocation}-${detailedLocation}`}>
        {`[${_.isNil(sphere) ? '?' : sphere}] ${generalLocation} | ${detailedLocation}`}
      </li>
    ));

    return (
      <div className="tooltip item-location">
        <div className="tooltip-title">Locations Found At</div>
        <ul>{locationsList}</ul>
      </div>
    );
  }
}

FoundAtTooltip.propTypes = {
  locations: PropTypes.arrayOf(PropTypes.shape({
    generalLocation: PropTypes.string.isRequired,
    detailedLocation: PropTypes.string.isRequired,
  })).isRequired,
};

export default FoundAtTooltip;
