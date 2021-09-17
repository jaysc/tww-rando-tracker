import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import DatabaseLogic from '../services/database-logic';
import DatabaseState from '../services/database-state';
import LogicCalculation from '../services/logic-calculation';
import LogicHelper from '../services/logic-helper';
import Permalink from '../services/permalink';
import Settings from '../services/settings';
import Spheres from '../services/spheres';
import TrackerState from '../services/tracker-state';

import Images from './images';
import KeyDownWrapper from './key-down-wrapper';
import RequirementsTooltip from './requirements-tooltip';
import Tooltip from './tooltip';

class DetailedLocationsTable extends React.PureComponent {
  static NUM_ROWS = 13;

  requirementsTooltip(generalLocation, detailedLocation, otherUserItems) {
    const { logic } = this.props;

    const requirements = logic.formattedRequirementsForLocation(generalLocation, detailedLocation);

    return (
      <RequirementsTooltip
        requirements={requirements}
        otherUserItems={otherUserItems}
      />
    );
  }

  itemTooltip(generalLocation, detailedLocation, otherUserItems) {
    const { trackerState } = this.props;

    const itemForLocation = trackerState.getItemForLocation(generalLocation, detailedLocation);

    if (_.isNil(itemForLocation) && _.isEmpty(otherUserItems)) {
      return null;
    }

    const prettyItemName = LogicHelper.prettyNameForItem(itemForLocation, null);

    return (
      <div className="tooltip">
        {prettyItemName && (
        <>
          <div className="tooltip-title">Item at Location</div>
          <div>{prettyItemName}</div>
        </>
        )}
        {!_.isEmpty(otherUserItems) && (
        <>
          <div className="tooltip-title">Other Users Item at Location</div>
          <div>{otherUserItems}</div>
        </>
        )}
      </div>
    );
  }

  detailedLocation(locationInfo, numColumns) {
    if (_.isNil(locationInfo)) {
      return null;
    }

    const {
      location,
      color,
    } = locationInfo;

    const {
      databaseState,
      disableLogic,
      openedLocation,
      spheres,
      trackSpheres,
      toggleLocationChecked,
    } = this.props;

    let fontSizeClassName = '';
    if (numColumns === 3) {
      fontSizeClassName = 'font-smallest';
    } else if (numColumns === 2) {
      fontSizeClassName = 'font-small';
    }

    const toggleLocationFunc = () => toggleLocationChecked(openedLocation, location);

    let locationText;
    if (trackSpheres) {
      const sphere = spheres.sphereForLocation(openedLocation, location);
      const sphereText = _.isNil(sphere) ? '?' : sphere;

      locationText = `[${sphereText}] ${location}`;
    } else {
      locationText = location;
    }

    const coopLocation = databaseState.coopFound(openedLocation, location);

    const locationElement = (
      <div
        className={`detail-span ${color} ${fontSizeClassName} ${coopLocation}`}
        onClick={toggleLocationFunc}
        onKeyDown={KeyDownWrapper.onSpaceKey(toggleLocationFunc)}
        role="button"
        tabIndex="0"
      >
        {locationText}
      </div>
    );

    const isLocationChecked = color === LogicCalculation.LOCATION_COLORS.CHECKED_LOCATION;

    const otherUserItems = _.map(databaseState
      .otherUsersItemForLocation(openedLocation, location),
    (itemName) => LogicHelper.prettyNameForItem(itemName, null));
    let locationContent;

    if (disableLogic || isLocationChecked) {
      let itemTooltip = null;
      if (trackSpheres) {
        itemTooltip = this.itemTooltip(openedLocation, location, otherUserItems);
      }

      locationContent = (
        <Tooltip tooltipContent={itemTooltip}>
          {locationElement}
        </Tooltip>
      );
    } else {
      const requirementsTooltip = this
        .requirementsTooltip(openedLocation, location, otherUserItems);

      locationContent = (
        <Tooltip tooltipContent={requirementsTooltip}>
          {locationElement}
        </Tooltip>
      );
    }

    return (
      <td key={location}>
        {locationContent}
      </td>
    );
  }

  render() {
    const {
      clearOpenedMenus,
      clearRaceModeBannedLocations,
      disableLogic,
      logic,
      onlyProgressLocations,
      openedLocation,
      openedLocationIsDungeon,
    } = this.props;

    const backgroundImage = _.get(Images.IMAGES, [
      openedLocationIsDungeon ? 'DUNGEON_CHART_BACKGROUNDS' : 'ISLAND_CHART_BACKGROUNDS',
      openedLocation,
    ]);
    const detailedLocations = logic.locationsList(
      openedLocation,
      {
        disableLogic,
        isDungeon: openedLocationIsDungeon,
        onlyProgressLocations,
      },
    );

    const locationChunks = _.chunk(detailedLocations, DetailedLocationsTable.NUM_ROWS);
    const arrangedLocations = _.zip(...locationChunks);
    const numColumns = _.size(locationChunks);

    const locationRows = _.map(arrangedLocations, (locationsRow, index) => (
      <tr key={index}>
        {_.map(locationsRow, (locationInfo) => this.detailedLocation(locationInfo, numColumns))}
      </tr>
    ));

    let clearAllElement;
    if (
      Settings.getOptionValue(Permalink.OPTIONS.RACE_MODE)
      && openedLocationIsDungeon
      && LogicHelper.isRaceModeDungeon(openedLocation)
    ) {
      const clearRaceModeBannedLocationsFunc = () => clearRaceModeBannedLocations(openedLocation);

      clearAllElement = (
        <td>
          <div
            className="detail-span"
            onClick={clearRaceModeBannedLocationsFunc}
            onKeyDown={KeyDownWrapper.onSpaceKey(clearRaceModeBannedLocationsFunc)}
            role="button"
            tabIndex="0"
          >
            ✓ Clear All
          </div>
        </td>
      );
    }

    return (
      <div className="zoom-map">
        <div className="zoom-map-cover" />
        <div className="zoom-map-background">
          <img src={backgroundImage} alt="" />
        </div>
        <table className="header-table">
          <tbody>
            <tr>
              <td>
                <div
                  className="detail-span"
                  onClick={clearOpenedMenus}
                  onKeyDown={KeyDownWrapper.onSpaceKey(clearOpenedMenus)}
                  role="button"
                  tabIndex="0"
                >
                  X Close
                </div>
              </td>
              {clearAllElement}
            </tr>
          </tbody>
        </table>
        <table className="detailed-locations-table">
          <tbody>
            {locationRows}
          </tbody>
        </table>
      </div>
    );
  }
}

DetailedLocationsTable.propTypes = {
  clearOpenedMenus: PropTypes.func.isRequired,
  clearRaceModeBannedLocations: PropTypes.func.isRequired,
  databaseState: PropTypes.instanceOf(DatabaseState).isRequired,
  disableLogic: PropTypes.bool.isRequired,
  logic: PropTypes.instanceOf(LogicCalculation).isRequired,
  onlyProgressLocations: PropTypes.bool.isRequired,
  openedLocation: PropTypes.string.isRequired,
  openedLocationIsDungeon: PropTypes.bool.isRequired,
  spheres: PropTypes.instanceOf(Spheres).isRequired,
  trackerState: PropTypes.instanceOf(TrackerState).isRequired,
  trackSpheres: PropTypes.bool.isRequired,
  toggleLocationChecked: PropTypes.func.isRequired,
};

export default DetailedLocationsTable;
