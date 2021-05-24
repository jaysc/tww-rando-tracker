import _, { last } from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import LogicCalculation from '../services/logic-calculation';

class Statistics extends React.PureComponent {
  render() {
    const {
      disableLogic,
      logic,
      onlyProgressLocations,
      singleColorBackground,
    } = this.props;

    const lastLocationInfo = () => {
      const lastLocation = _.get(logic, ['state', 'lastLocation']);
      if (lastLocation) {
        const {
          generalLocation,
          detailedLocation,
        } = lastLocation;

        return detailedLocation;
      }
      return '';
    };

    return (
      <div className={`statistics ${singleColorBackground ? 'single-color' : ''}`}>
        <table className="left-table">
          <tbody>
            <tr>
              <td>{logic.totalLocationsChecked({ onlyProgressLocations })}</td>
              <td>Locations Checked</td>
            </tr>
            {!disableLogic && (
              <tr>
                <td>{logic.totalLocationsAvailable({ onlyProgressLocations })}</td>
                <td>Locations Accessible</td>
              </tr>
            )}
            <tr>
              <td>{logic.totalLocationsRemaining({ onlyProgressLocations })}</td>
              <td>Locations Remaining</td>
            </tr>
          </tbody>
        </table>
        <table className="right-table">
          <tbody>
            {!disableLogic && (
              <tr>
                <td>{logic.itemsNeededToFinishGame()}</td>
                <td>Items Needed to Finish Game</td>
              </tr>
            )}
            {!disableLogic && (
              <tr>
                <td>{logic.estimatedLocationsLeftToCheck()}</td>
                <td>Estimated Locations Left to Check</td>
              </tr>
            )}
          </tbody>
        </table>
        <div className="info">
          {`Last Location: ${lastLocationInfo() ?? ''}`}
        </div>
      </div>
    );
  }
}

Statistics.propTypes = {
  disableLogic: PropTypes.bool.isRequired,
  logic: PropTypes.instanceOf(LogicCalculation).isRequired,
  onlyProgressLocations: PropTypes.bool.isRequired,
  singleColorBackground: PropTypes.bool.isRequired,
};

export default Statistics;
