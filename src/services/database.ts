import { v4 } from "uuid";
import _ from "lodash";

export interface IDatabase {
  userId?: string;
  permaId: string;
  gameId: string;
  mode?: Mode;
  databaseInitialLoad: () => void;
  databaseUpdate: (data: OnDataSaved) => void;
}

export default class Database {
  websocket: WebSocket;
  permaId: string;
  gameId: string;
  userId: string;
  mode: Mode;
  roomId: string;

  retryInterval?: NodeJS.Timeout;

  databaseInitialLoad: () => void;
  databaseUpdate: (data: OnDataSaved) => void;

  state: {
    items: Record<string, Record<string, UserItem>>;
    locations: object;
  };

  constructor(options: IDatabase) {
    console.log("connecting to server");
    this.gameId = options.gameId;
    this.permaId = options.permaId;
    this.databaseInitialLoad = options.databaseInitialLoad;
    this.databaseUpdate = options.databaseUpdate;
    this.mode = options.mode ?? Mode.ITEMSYNC;
  }

  public connect() {
    this.websocket = new WebSocket(process.env.WEBSOCKET_SERVER, "protocolOne");

    this.websocket.onmessage = this.handleOnMessage.bind(this);

    this.websocket.onopen = function (event) {
      clearInterval(this.retryInterval);
      this.retryInterval = null;
      console.log("connected to server");
    }.bind(this);

    this.websocket.onclose = function (event) {
      console.log("disconnected from server");
      this.retryConnect();
    }.bind(this);

    this.websocket.onerror = function (event) {}.bind(this);
  }

  private retryConnect() {
    if (!this.retryInterval) {
      this.retryInterval = setInterval(this.connect.bind(this), 2000);
    }
  }

  private joinroom() {
    const message = {
      method: "joinRoom",
      payload: {
        name: this.gameId,
        perma: this.permaId,
        mode: "ITEMSYNC",
      },
    };
    this.send(message);
  }

  private getItem(itemName?: string) {
    const message = {
      method: "get",
      payload: {
        type: "ITEM",
        itemName,
      },
    };
    this.send(message);
  }

  public setItem(
    itemName: string,
    {
      count,
      generalLocation,
      detailedLocation,
    }: { count: number; generalLocation?: string; detailedLocation?: string }
  ) {
    const message = {
      method: "set",
      payload: {
        type: "ITEM",
        itemName,
        count,
        generalLocation,
        detailedLocation,
      },
    };
    this.send(message);
  }

  private getLocation(generalLocation: string, detailedLocation: string) {
    const message = {
      method: "get",
      data: {
        type: "LOCATION",
        generalLocation,
        detailedLocation,
      },
    };

    this.send(message);
  }

  public setLocation(
    generalLocation: string,
    detailedLocation: string,
    isChecked: boolean,
    itemName?: string
  ) {
    const message = {
      method: "set",
      payload: {
        type: "LOCATION",
        generalLocation,
        detailedLocation,
        isChecked,
        itemName,
      },
    };

    this.send(message);
  }

  private send(message: object): string {
    const messageId = v4();
    _.set(message, "messageId", messageId);

    this.websocket.send(JSON.stringify(message));

    return messageId;
  }

  private handleOnMessage(response) {
    const responseData = JSON.parse(response.data) as MessageEvent;

    console.log("Recieved message:", responseData);

    if (responseData.err) {
      console.warn(responseData.err);
    }

    if (responseData.message) {
      console.log(responseData.message);
    }

    const event = responseData.event;

    switch (event) {
      case "onConnect":
        this.setUserId(responseData.data as OnConnect);
        this.joinroom();
        break;
      case "joinedRoom":
        this.onJoinedRoom(responseData.data as OnJoinedRoom);
        break;
      case "dataSaved":
        this.onDataSaved(responseData.data as OnDataSaved);
        break;
    }
  }

  private setUserId(data: OnConnect) {
    this.userId = data.userId;
    document.cookie = `userId=${this.userId}; Secure`;
    console.log(`userId set to '${this.userId}'`);
  }
  private onJoinedRoom(data: OnJoinedRoom) {
    //Initial load
    this.state = data;
    this.roomId = data.id;
    this.databaseInitialLoad();
  }

  private onDataSaved(data: OnDataSaved) {
    this.databaseUpdate(data);
  }
}

interface MessageEvent {
  event?: string;
  data?: object;
  message?: string;
  err?: string;
}

interface OnConnect {
  userId: string;
}

export interface OnJoinedRoom {
  id: string;
  //(itemname -> (User -> useritem))
  items: Record<string, Record<string, UserItem>>;

  // Key: generalLocation#detailedLocation
  //(key -> (User -> useritem))
  locations: Record<string, Record<string, UserLocation>>;
}

type UserItem = {
  count: number;
  generalLocation?: string;
  detailedLocation?: string;
};

type UserLocation = {
  generalLocation: string;
  detailedLocation: string;
};

export enum Mode {
  ITEMSYNC = "ITEMSYNC",
  COOP = "COOP",
}

export enum SaveDataType {
  ITEM = "ITEM",
  LOCATION = "LOCATION",
}

export type OnDataSaved = {
  count?: number;
  itemName?: string;
  type: SaveDataType;
  userId: string;
  generalLocation?: string;
  detailedLocation?: string;
  isChecked?: boolean;
};