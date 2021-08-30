import _ from 'lodash';

import DatabaseLogic from './database-logic';
import LogicHelper from './logic-helper';

export default class DatabaseData {
  constructor() {
    this.items = {};
    this.locationsChecked = {};
    this.entrances = {};
    this.perma = null;
    this.gameId = null;
    this.subscription = null;
    this.coop = false;
  }

  setup(perma, gameId) {
    this.perma = perma;
    this.gameId = gameId;

    this.coop = gameId.includes('coop');
  }

  setItemValue(itemName, itemCount) {
    _.set(this.items, [itemName, 'value'], itemCount);
  }

  unsetItemValue(itemName) {
    _.unset(this.items, itemName);
  }

  getItemValue(itemName) {
    return _.get(this.items, [itemName, 'value'], 0);
  }

  incrementItem(itemName) {
    const originalItemCount = this.getItemValue(itemName);
    const newItemCount = 1 + originalItemCount;
    const maxItemCount = LogicHelper.maxItemCount(itemName);
    if (newItemCount > maxItemCount) {
      this.unsetItemValue(itemName);
    } else {
      this.setItemValue(itemName, newItemCount);
    }
  }

  decrementItem(itemName) {
    const originalItemCount = this.getItemValue(itemName);
    let newItemCount = originalItemCount - 1;
    newItemCount = LogicHelper.maxItemCount(itemName);
    this.setItemValue(itemName, newItemCount);
  }

  isLocationChecked(generalLocation, detailedLocation) {
    return _.get(this.locationsChecked, [generalLocation, detailedLocation]);
  }

  toggleLocationChecked(generalLocation, detailedLocation) {
    const isChecked = this.isLocationChecked(generalLocation, detailedLocation);
    _.set(this.locationsChecked, [generalLocation, detailedLocation], !isChecked);
  }

  readState() {
    return {
      entrances: this.entrances,
      items: this.items,
      locationsChecked: this.locationsChecked,
    };
  }

  save() {
    if (this.coop) {
      DatabaseLogic.saveCoopGame(this);
    } else {
      DatabaseLogic.saveGame(this);
    }
  }

  load() {
    if (this.coop) {
      this.loadCoopGame(this);
    } else {
      this.loadGame(this);
    }
  }

  loadCoopGame() {
    const handleData = (gameData) => {
      console.log(`Load Key: ${gameData.key}`);
      console.log(gameData);
    };

    DatabaseLogic.loadGame(this, handleData);
  }

  loadGame() {
    const handleData = (gameData) => {
      console.log(gameData);
    };

    DatabaseLogic.loadGame(this, handleData);
  }

  loadUserGame() {
    const handleData = (databaseData) => {
      console.log(databaseData);
    };

    DatabaseLogic.loadUserGame(this, handleData);
  }
}
