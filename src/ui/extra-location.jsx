import _ from 'lodash';
import PropTypes from 'prop-types';
import React from 'react';

import LogicHelper from '../services/logic-helper';

import Images from './images';
import Item from './item';

class ExtraLocation extends React.PureComponent {
  smallKeyItem() {
    const {
      clearSelectedItem,
      decrementItem,
      incrementItem,
      setSelectedItem,
      smallKeyCount,
      smallKeyName,
    } = this.props;

    const smallKeyImages = _.get(Images.IMAGES, 'SMALL_KEYS');

    return (
      <div className="dungeon-item small-key">
        <Item
          clearSelectedItem={clearSelectedItem}
          decrementItem={decrementItem}
          images={smallKeyImages}
          incrementItem={incrementItem}
          itemCount={smallKeyCount}
          itemName={smallKeyName}
          setSelectedItem={setSelectedItem}
        />
      </div>
    );
  }

  bigKeyItem() {
    const {
      bigKeyCount,
      bigKeyName,
      clearSelectedItem,
      decrementItem,
      incrementItem,
      setSelectedItem,
    } = this.props;

    const bigKeyImages = _.get(Images.IMAGES, 'BIG_KEYS');

    return (
      <div className="dungeon-item big-key">
        <Item
          clearSelectedItem={clearSelectedItem}
          decrementItem={decrementItem}
          images={bigKeyImages}
          incrementItem={incrementItem}
          itemCount={bigKeyCount}
          itemName={bigKeyName}
          setSelectedItem={setSelectedItem}
        />
      </div>
    );
  }

  compassItem() {
    const {
      clearSelectedItem,
      compassCount,
      compassName,
      decrementItem,
      incrementItem,
      setSelectedItem,
    } = this.props;

    const compassItemImages = _.get(Images.IMAGES, 'COMPASS');
    return (
      <div className="dungeon-item compass">
        <Item
          clearSelectedItem={clearSelectedItem}
          decrementItem={decrementItem}
          images={compassItemImages}
          incrementItem={incrementItem}
          setSelectedItem={setSelectedItem}
          itemCount={compassCount}
          itemName={compassName}
        />
      </div>
    );
  }

  mapItem() {
    const {
      clearSelectedItem,
      decrementItem,
      incrementItem,
      mapCount,
      mapName,
      setSelectedItem,
    } = this.props;

    const mapItemImages = _.get(Images.IMAGES, 'MAP');
    return (
      <div className="dungeon-item map">
        <Item
          clearSelectedItem={clearSelectedItem}
          decrementItem={decrementItem}
          images={mapItemImages}
          incrementItem={incrementItem}
          setSelectedItem={setSelectedItem}
          itemCount={mapCount}
          itemName={mapName}
        />
      </div>
    );
  }

  entrance() {
    const {
      clearSelectedItem,
      entryCount,
      entryName,
      locationName,
      setSelectedExit,
      unsetExit,
      updateOpenedExit,
    } = this.props;

    const entranceImages = _.get(Images.IMAGES, 'DUNGEON_ENTRANCE');

    const setSelectedItemFunc = () => setSelectedExit(locationName);

    const incrementItemFunc = () => {
      if (entryCount > 0) {
        unsetExit(locationName);
      } else {
        updateOpenedExit(locationName);
      }
    };

    return (
      <div className="dungeon-item dungeon-entry">
        <Item
          clearSelectedItem={clearSelectedItem}
          images={entranceImages}
          incrementItem={incrementItemFunc}
          itemCount={entryCount}
          itemName={entryName}
          setSelectedItem={setSelectedItemFunc}
        />
      </div>
    );
  }

  dungeonItems() {
    const {
      speedrunMode,
    } = this.props;

    return (
      <div className="dungeon-items">
        {this.smallKeyItem()}
        { LogicHelper.isRandomDungeonEntrances() && this.entrance() }
        {this.bigKeyItem()}
        {speedrunMode && this.compassItem()}
        {speedrunMode && this.mapItem()}
      </div>
    );
  }

  locationIcon() {
    const {
      locationIcon,
      locationName,
    } = this.props;

    return (
      <div className="dungeon-icon">
        <img src={locationIcon} alt={locationName} />
      </div>
    );
  }

  chestsCounter() {
    const {
      color,
      disableLogic,
      numAvailable,
      numRemaining,
    } = this.props;

    const className = `extra-location-chests ${color}`;
    const chestCounts = disableLogic ? numRemaining : `${numAvailable}/${numRemaining}`;

    return (
      <div className={className}>
        {chestCounts}
      </div>
    );
  }

  render() {
    const {
      clearSelectedLocation,
      isDungeon,
      isMainDungeon,
      locationName,
      setSelectedLocation,
      updateOpenedLocation,
    } = this.props;

    const updateOpenedLocationFunc = () => updateOpenedLocation({
      isDungeon,
      locationName,
    });

    const setSelectedLocationFunc = () => setSelectedLocation({
      isDungeon,
      locationName,
    });

    return (
      <div
        className="extra-location"
        onBlur={clearSelectedLocation}
        onClick={updateOpenedLocationFunc}
        onFocus={setSelectedLocationFunc}
        onKeyDown={updateOpenedLocationFunc}
        onMouseOver={setSelectedLocationFunc}
        onMouseOut={clearSelectedLocation}
        role="button"
        tabIndex="0"
      >
        {isMainDungeon && this.dungeonItems()}
        {this.locationIcon()}
        {this.chestsCounter()}
      </div>
    );
  }
}

ExtraLocation.defaultProps = {
  bigKeyCount: null,
  bigKeyName: null,
  clearSelectedItem: null,
  compassCount: null,
  compassName: null,
  decrementItem: null,
  entryCount: null,
  entryName: null,
  incrementItem: null,
  mapCount: null,
  mapName: null,
  setSelectedExit: null,
  setSelectedItem: null,
  smallKeyCount: null,
  smallKeyName: null,
  speedrunMode: null,
  unsetExit: null,
  updateOpenedExit: null,
};

ExtraLocation.propTypes = {
  bigKeyCount: PropTypes.number,
  bigKeyName: PropTypes.string,
  clearSelectedItem: PropTypes.func,
  clearSelectedLocation: PropTypes.func.isRequired,
  color: PropTypes.string.isRequired,
  compassCount: PropTypes.number,
  compassName: PropTypes.string,
  decrementItem: PropTypes.func,
  disableLogic: PropTypes.bool.isRequired,
  entryCount: PropTypes.number,
  entryName: PropTypes.string,
  incrementItem: PropTypes.func,
  isDungeon: PropTypes.bool.isRequired,
  isMainDungeon: PropTypes.bool.isRequired,
  locationIcon: PropTypes.string.isRequired,
  locationName: PropTypes.string.isRequired,
  mapCount: PropTypes.number,
  mapName: PropTypes.string,
  numAvailable: PropTypes.number.isRequired,
  numRemaining: PropTypes.number.isRequired,
  setSelectedExit: PropTypes.func,
  setSelectedItem: PropTypes.func,
  setSelectedLocation: PropTypes.func.isRequired,
  smallKeyCount: PropTypes.number,
  smallKeyName: PropTypes.string,
  speedrunMode: PropTypes.bool,
  unsetExit: PropTypes.func,
  updateOpenedExit: PropTypes.func,
  updateOpenedLocation: PropTypes.func.isRequired,
};

export default ExtraLocation;
