# TWW Randomizer Tracker Coop

This is a online synchronized tracker for [The Wind Waker Randomizer](https://github.com/LagoLunatic/wwrando). You can create an online room where the tracker will be synced with all connected clients (items and locations).

It's available [here](https://tww-rando-tracker-coop.herokuapp.com/).

Server code can be found [here](https://github.com/jaysc/tww-rando-tracker-coop-server).

Based on the original tracker by [wooferzfg](https://github.com/wooferzfg/tww-rando-tracker).

## Build Instructions

Building and running the tracker locally requires you to [install Node 14](https://nodejs.org/en/download/).

After installing Node and cloning the repository, install the required dependencies:
```bash
npm install
```
You can then build and serve the tracker application:
```bash
npm start
```
After the server starts, you can go to http://localhost:8080/ to open the tracker.
