import _ from "lodash";
import PropTypes from "prop-types";
import React from "react";
import { Oval } from "react-loader-spinner";
import { ToastContainer, toast } from "react-toastify";

import LogicHelper from "../services/logic-helper";
import TrackerController from "../services/tracker-controller";

import Buttons from "./buttons";
import ColorPickerWindow from "./color-picker-window";
import Images from "./images";
import ItemsTable from "./items-table";
import LocationsTable from "./locations-table";
import SphereTracking from "./sphere-tracking";
import Statistics from "./statistics";
import Storage from "./storage";

import "react-toastify/dist/ReactToastify.css";
import Database, {
  Mode,
  OnDataSaved,
  OnJoinedRoom,
  SaveDataType,
} from "../services/database";
import TrackerState from "../services/tracker-state";

interface ITrackerProps {
  loadProgress: boolean;
  permalink: string;
  gameId?: string;
}

interface ITrackerState {
  colorPickerOpen: boolean;
  colors?: {
    extraLocationsBackground;
    itemsTableBackground;
    sphereTrackingBackground;
    statisticsBackground;
  };
  database?: Database;
  disableLogic: boolean;
  entrancesListOpen: boolean;
  isLoading: boolean;
  lastLocation?;
  logic?;
  onlyProgressLocations: boolean;
  openedExit?;
  openedLocation?;
  openedLocationIsDungeon?;
  saveData?;
  spheres?;
  trackSpheres: boolean;
  trackerState?: TrackerState;
}

class Tracker extends React.PureComponent<ITrackerProps, ITrackerState> {
  static propTypes: {
    loadProgress: PropTypes.Validator<boolean>;
    permalink: PropTypes.Validator<string>;
  };

  constructor(props) {
    super(props);

    this.state = {
      colorPickerOpen: false,
      colors: {
        extraLocationsBackground: null,
        itemsTableBackground: null,
        sphereTrackingBackground: null,
        statisticsBackground: null,
      },
      database: null,
      disableLogic: false,
      entrancesListOpen: false,
      isLoading: true,
      lastLocation: null,
      onlyProgressLocations: true,
      openedExit: null,
      openedLocation: null,
      openedLocationIsDungeon: null,
      trackSpheres: false,
    };

    this.initialize();
    this.clearOpenedMenus = this.clearOpenedMenus.bind(this);
    this.clearRaceModeBannedLocations =
      this.clearRaceModeBannedLocations.bind(this);
    this.decrementItem = this.decrementItem.bind(this);
    this.incrementItem = this.incrementItem.bind(this);
    this.toggleColorPicker = this.toggleColorPicker.bind(this);
    this.toggleDisableLogic = this.toggleDisableLogic.bind(this);
    this.toggleEntrancesList = this.toggleEntrancesList.bind(this);
    this.toggleLocationChecked = this.toggleLocationChecked.bind(this);
    this.toggleOnlyProgressLocations =
      this.toggleOnlyProgressLocations.bind(this);
    this.toggleTrackSpheres = this.toggleTrackSpheres.bind(this);
    this.unsetExit = this.unsetExit.bind(this);
    this.unsetLastLocation = this.unsetLastLocation.bind(this);
    this.updateColors = this.updateColors.bind(this);
    this.updateEntranceForExit = this.updateEntranceForExit.bind(this);
    this.updateOpenedExit = this.updateOpenedExit.bind(this);
    this.updateOpenedLocation = this.updateOpenedLocation.bind(this);

    this.databaseInitialLoad = this.databaseInitialLoad.bind(this);
    this.databaseUpdate = this.databaseUpdate.bind(this);
  }

  async initialize() {
    await Images.importImages();

    const preferences = Storage.loadPreferences();
    if (!_.isNil(preferences)) {
      this.updatePreferences(preferences);
    }

    const { loadProgress, permalink, gameId } = this.props;

    let initialData;
    let database: Database;
    if (gameId) {
      // gameId means multiplayer
      // todo get cookie etc
      database = new Database({
        permaId: permalink,
        gameId: gameId,
        databaseInitialLoad: this.databaseInitialLoad.bind(this),
        databaseUpdate: this.databaseUpdate.bind(this),
      });
    } else {
      if (loadProgress) {
        const saveData = Storage.loadFromStorage();

        if (!_.isNil(saveData)) {
          try {
            initialData = TrackerController.initializeFromSaveData(saveData);

            toast.success("Progress loaded!");
          } catch (err) {
            TrackerController.reset();
          }
        }

        if (_.isNil(initialData)) {
          toast.error("Could not load progress from save data!");
        }
      }
    }
    if (_.isNil(initialData)) {
      try {
        const decodedPermalink = decodeURIComponent(permalink);

        initialData = await TrackerController.initializeFromPermalink(
          decodedPermalink
        );
      } catch (err) {
        toast.error("Tracker could not be initialized!");

        throw err;
      }
    }

    const { logic, saveData, spheres, trackerState } = initialData;

    this.setState({
      database,
      isLoading: false,
      logic,
      saveData,
      spheres,
      trackerState,
    });

    if (database) {
      database.connect();
    }
  }

  databaseInitialLoad() {
    const { trackerState, database } = this.state;
    const newTrackerState = trackerState._clone({
      items: true,
      locationsChecked: true,
    });

    for (let itemName in database.state.items) {
      const userDicts = database.state.items[itemName];
      let count;
      if (database.mode == Mode.ITEMSYNC) {
        count = userDicts[database.roomId]?.count;
      } else {
        count = userDicts[database.userId]?.count;
      }

      _.set(newTrackerState.items, itemName, count ?? 0);
    }

    for (let location in database.state.locations) {
      const [generalLocation, detailedLocation] = location.split("#");
      let isChecked;

      if (database.mode == Mode.ITEMSYNC) {
        isChecked =
          database.state.locations[location][database.roomId]?.isChecked;
      } else {
        isChecked =
          database.state.locations[location][database.userId]?.isChecked;
      }

      _.set(
        newTrackerState.locationsChecked,
        [generalLocation, detailedLocation],
        isChecked ?? false
      );
    }

    this.updateTrackerState(newTrackerState);
  }

  databaseUpdate(data: OnDataSaved) {
    const { trackerState } = this.state;

    let newTrackerState;
    if (data.type == SaveDataType.ITEM) {
      newTrackerState = trackerState._clone({ items: true });

      _.set(newTrackerState.items, data.itemName, data.count ?? 0);
    } else if (data.type == SaveDataType.LOCATION) {
      newTrackerState = trackerState._clone({ locationsChecked: true });

      _.set(
        newTrackerState.locationsChecked,
        [data.generalLocation, data.detailedLocation],
        data.isChecked ?? false
      );
    }

    this.updateTrackerState(newTrackerState);
  }

  incrementItem(itemName: string) {
    const { lastLocation, trackerState, database } = this.state;

    let newTrackerState = trackerState.incrementItem(itemName);

    if (!_.isNil(lastLocation)) {
      const { generalLocation, detailedLocation } = lastLocation;

      newTrackerState = newTrackerState.setItemForLocation(
        itemName,
        generalLocation,
        detailedLocation
      );
    }

    if (database) {
      const { generalLocation, detailedLocation } = lastLocation ?? {};

      database.setItem(itemName, {
        count: newTrackerState.getItemValue(itemName),
        generalLocation,
        detailedLocation,
      });
    }

    this.updateTrackerState(newTrackerState);
  }

  decrementItem(itemName) {
    const { trackerState, database } = this.state;

    const newTrackerState = trackerState.decrementItem(itemName);

    if (database) {
      database.setItem(itemName, {
        count: newTrackerState.getItemValue(itemName),
      });
    }

    this.updateTrackerState(newTrackerState);
  }

  toggleLocationChecked(generalLocation, detailedLocation) {
    const { trackerState, database } = this.state;

    let newTrackerState = trackerState.toggleLocationChecked(
      generalLocation,
      detailedLocation
    );

    if (newTrackerState.isLocationChecked(generalLocation, detailedLocation)) {
      this.setState({
        lastLocation: {
          generalLocation,
          detailedLocation,
        },
      });

      if (database) {
        database.setLocation(generalLocation, detailedLocation, true);
      }
    } else {
      this.setState({ lastLocation: null });

      newTrackerState = newTrackerState.unsetItemForLocation(
        generalLocation,
        detailedLocation
      );

      if (database) {
        database.setLocation(generalLocation, detailedLocation, false);
      }
    }

    this.updateTrackerState(newTrackerState);
  }

  clearRaceModeBannedLocations(dungeonName) {
    let { trackerState: newTrackerState } = this.state;

    const raceModeBannedLocations =
      LogicHelper.raceModeBannedLocations(dungeonName);

    _.forEach(
      raceModeBannedLocations,
      ({ generalLocation, detailedLocation }) => {
        if (
          !newTrackerState.isLocationChecked(generalLocation, detailedLocation)
        ) {
          newTrackerState = newTrackerState.toggleLocationChecked(
            generalLocation,
            detailedLocation
          );
        }
      }
    );

    this.updateTrackerState(newTrackerState);
  }

  updateTrackerState(newTrackerState) {
    const { logic, saveData, spheres, trackerState } =
      TrackerController.refreshState(newTrackerState);

    Storage.saveToStorage(saveData);

    this.setState({
      logic,
      saveData,
      spheres,
      trackerState,
    });
  }

  toggleDisableLogic() {
    const { disableLogic } = this.state;

    this.updatePreferences({ disableLogic: !disableLogic });
  }

  clearOpenedMenus() {
    this.setState({
      entrancesListOpen: false,
      openedExit: null,
      openedLocation: null,
      openedLocationIsDungeon: null,
    });
  }

  updateOpenedExit(dungeonOrCaveName) {
    this.setState({
      entrancesListOpen: false,
      openedExit: dungeonOrCaveName,
      openedLocation: null,
      openedLocationIsDungeon: null,
    });
  }

  unsetExit(dungeonOrCaveName) {
    const { trackerState } = this.state;

    const entryName = LogicHelper.entryName(dungeonOrCaveName);
    const newTrackerState = trackerState
      .incrementItem(entryName)
      .unsetEntranceForExit(dungeonOrCaveName);

    this.updateTrackerState(newTrackerState);
  }

  updateEntranceForExit(exitName, entranceName) {
    const { trackerState } = this.state;

    const entryName = LogicHelper.entryName(exitName);
    const newTrackerState = trackerState
      .incrementItem(entryName)
      .setEntranceForExit(exitName, entranceName);

    this.updateTrackerState(newTrackerState);
    this.clearOpenedMenus();
  }

  updateOpenedLocation({ locationName, isDungeon }) {
    this.setState({
      entrancesListOpen: false,
      openedExit: null,
      openedLocation: locationName,
      openedLocationIsDungeon: isDungeon,
    });
  }

  toggleEntrancesList() {
    const { entrancesListOpen } = this.state;

    this.setState({
      entrancesListOpen: !entrancesListOpen,
      openedExit: null,
      openedLocation: null,
      openedLocationIsDungeon: null,
    });
  }

  toggleOnlyProgressLocations() {
    const { onlyProgressLocations } = this.state;

    this.updatePreferences({ onlyProgressLocations: !onlyProgressLocations });
  }

  toggleColorPicker() {
    const { colorPickerOpen } = this.state;

    this.setState({
      colorPickerOpen: !colorPickerOpen,
    });
  }

  toggleTrackSpheres() {
    const { trackSpheres } = this.state;

    this.updatePreferences({ trackSpheres: !trackSpheres });
  }

  unsetLastLocation() {
    this.setState({ lastLocation: null });
  }

  updateColors(colorChanges) {
    this.updatePreferences({ colors: colorChanges });
  }

  updatePreferences(preferenceChanges) {
    const { colors, disableLogic, onlyProgressLocations, trackSpheres } =
      this.state;

    const existingPreferences = {
      colors,
      disableLogic,
      onlyProgressLocations,
      trackSpheres,
    };

    const newPreferences = _.merge({}, existingPreferences, preferenceChanges);

    this.setState(newPreferences);
    Storage.savePreferences(newPreferences);
  }

  render() {
    const {
      colorPickerOpen,
      colors,
      database,
      disableLogic,
      entrancesListOpen,
      isLoading,
      lastLocation,
      logic,
      onlyProgressLocations,
      openedExit,
      openedLocation,
      openedLocationIsDungeon,
      saveData,
      spheres,
      trackSpheres,
      trackerState,
    } = this.state;

    const {
      extraLocationsBackground,
      itemsTableBackground,
      sphereTrackingBackground,
      statisticsBackground,
    } = colors;

    let content;

    if (isLoading) {
      content = (
        <div className="loading-spinner">
          <Oval color="white" secondaryColor="gray" />
        </div>
      );
    } else {
      content = (
        <div className="tracker-container">
          <div className="tracker">
            <ItemsTable
              backgroundColor={itemsTableBackground}
              decrementItem={this.decrementItem}
              incrementItem={this.incrementItem}
              spheres={spheres}
              trackerState={trackerState}
              trackSpheres={trackSpheres}
            />
            <LocationsTable
              database={database}
              backgroundColor={extraLocationsBackground}
              clearOpenedMenus={this.clearOpenedMenus}
              clearRaceModeBannedLocations={this.clearRaceModeBannedLocations}
              decrementItem={this.decrementItem}
              disableLogic={disableLogic}
              entrancesListOpen={entrancesListOpen}
              incrementItem={this.incrementItem}
              logic={logic}
              onlyProgressLocations={onlyProgressLocations}
              openedExit={openedExit}
              openedLocation={openedLocation}
              openedLocationIsDungeon={openedLocationIsDungeon}
              spheres={spheres}
              toggleLocationChecked={this.toggleLocationChecked}
              trackerState={trackerState}
              trackSpheres={trackSpheres}
              unsetExit={this.unsetExit}
              updateEntranceForExit={this.updateEntranceForExit}
              updateOpenedExit={this.updateOpenedExit}
              updateOpenedLocation={this.updateOpenedLocation}
            />
            <Statistics
              backgroundColor={statisticsBackground}
              disableLogic={disableLogic}
              logic={logic}
              onlyProgressLocations={onlyProgressLocations}
            />
          </div>
          {trackSpheres && (
            <SphereTracking
              backgroundColor={sphereTrackingBackground}
              lastLocation={lastLocation}
              trackerState={trackerState}
              unsetLastLocation={this.unsetLastLocation}
            />
          )}
          {colorPickerOpen && (
            <ColorPickerWindow
              extraLocationsBackground={extraLocationsBackground}
              itemsTableBackground={itemsTableBackground}
              sphereTrackingBackground={sphereTrackingBackground}
              statisticsBackground={statisticsBackground}
              toggleColorPicker={this.toggleColorPicker}
              updateColors={this.updateColors}
            />
          )}
          <Buttons
            colorPickerOpen={colorPickerOpen}
            disableLogic={disableLogic}
            entrancesListOpen={entrancesListOpen}
            onlyProgressLocations={onlyProgressLocations}
            saveData={saveData}
            trackSpheres={trackSpheres}
            toggleColorPicker={this.toggleColorPicker}
            toggleDisableLogic={this.toggleDisableLogic}
            toggleEntrancesList={this.toggleEntrancesList}
            toggleOnlyProgressLocations={this.toggleOnlyProgressLocations}
            toggleTrackSpheres={this.toggleTrackSpheres}
          />
        </div>
      );
    }

    return (
      <>
        {content}
        <ToastContainer />
      </>
    );
  }
}

Tracker.propTypes = {
  loadProgress: PropTypes.bool.isRequired,
  permalink: PropTypes.string.isRequired,
};

export default Tracker;
