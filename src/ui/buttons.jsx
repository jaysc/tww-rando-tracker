import PropTypes from 'prop-types';
import React from 'react';

import LogicHelper from '../services/logic-helper';

import Storage from './storage';

class Buttons extends React.PureComponent {
  constructor(props) {
    super(props);

    this.exportProgress = this.exportProgress.bind(this);
  }

  async exportProgress() {
    const { saveData } = this.props;

    await Storage.exportFile(saveData);
  }

  render() {
    const {
      colorPickerOpen,
      disableLogic,
      entrancesListOpen,
      onlyProgressLocations,
      settingsWindowOpen,
      trackSpheres,
      toggleColorPicker,
      toggleDisableLogic,
      toggleEntrancesList,
      toggleOnlyProgressLocations,
      toggleSettingsWindow,
      toggleTrackSpheres,
    } = this.props;

    const colorPickerText = colorPickerOpen
      ? 'Close Color Picker'
      : 'Open Color Picker';
    const entrancesListText = entrancesListOpen
      ? 'Close Entrances'
      : 'View Entrances';
    const settingsWindowText = settingsWindowOpen
      ? 'Close Settings Window'
      : 'Open Settings Window';
    const isRandomEntrances = LogicHelper.isRandomEntrances();

    return (
      <div className="buttons">
        <button
          onClick={this.exportProgress}
          type="button"
        >
          Export Progress
        </button>
        <button
          onClick={toggleOnlyProgressLocations}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={!onlyProgressLocations} readOnly />
          Show Non-Progress Locations
        </button>
        {
          isRandomEntrances && (
            <button
              onClick={toggleEntrancesList}
              type="button"
            >
              {entrancesListText}
            </button>
          )
        }
        <button
          onClick={toggleDisableLogic}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={!disableLogic} readOnly />
          Show Location Logic
        </button>
        <button
          onClick={toggleTrackSpheres}
          type="button"
        >
          <input type="checkbox" className="button-checkbox" checked={trackSpheres} readOnly />
          Track Spheres
        </button>
        <button
          onClick={toggleColorPicker}
          type="button"
        >
          {colorPickerText}
        </button>
        <button
          onClick={toggleSettingsWindow}
          type="button"
        >
          {settingsWindowText}
        </button>
      </div>
    );
  }
}

Buttons.propTypes = {
  colorPickerOpen: PropTypes.bool.isRequired,
  disableLogic: PropTypes.bool.isRequired,
  entrancesListOpen: PropTypes.bool.isRequired,
  onlyProgressLocations: PropTypes.bool.isRequired,
  saveData: PropTypes.string.isRequired,
  settingsWindowOpen: PropTypes.bool.isRequired,
  trackSpheres: PropTypes.bool.isRequired,
  toggleColorPicker: PropTypes.func.isRequired,
  toggleDisableLogic: PropTypes.func.isRequired,
  toggleEntrancesList: PropTypes.func.isRequired,
  toggleOnlyProgressLocations: PropTypes.func.isRequired,
  toggleSettingsWindow: PropTypes.func.isRequired,
  toggleTrackSpheres: PropTypes.func.isRequired,
};

export default Buttons;
