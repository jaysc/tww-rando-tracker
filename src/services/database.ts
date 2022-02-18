import { v4 } from "uuid";
import _ from "lodash";

export interface IDatabase {
  userId?: string;
  permaId: string;
  gameId: string;
}

export default class Database {
  websocket: WebSocket;
  permaId: string;
  gameId: string;
  userId: string;

  constructor(options: IDatabase) {
    //todo add env
    //todo cookie read
    console.log("connecting to server");
    this.websocket = new WebSocket("ws://localhost:3001/ws", "protocolOne");
    this.gameId = options.gameId;
    this.permaId = options.permaId;

    this.websocket.onmessage = this.handleOnMessage.bind(this);

    this.websocket.onopen = function (event) {
      console.log("connected to server");
    }.bind(this);

    this.websocket.onclose = function (event) {
      //todo handle retry logic
      console.log("disconnected from server");
    }.bind(this);

    this.websocket.onerror = function (event) {}.bind(this);
  }

  private joinroom() {
    const message = {
      method: "joinRoom",
      payload: {
        name: this.gameId,
        perma: this.permaId,
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

  private handleOnMessage(response: MessageEvent) {
    const data = JSON.parse(response.data);

    console.log("Recieved message:", data);

    const event = _.get(data, "event");

    switch (event) {
      case "onConnect":
        this.setUserId(data);
        this.joinroom();
        break;
      case "joinedRoom":
        this.joinedRoom(data);
        break;
    }

    if (data.err) {
      console.warn(data.err);
    }

    if (data.message) {
      console.log(data.message);
    }
  }

  private setUserId(data: object) {
    this.userId = _.get(data, ["data", "userId"]);
    document.cookie = `userId=${this.userId}; Secure`;
    console.log(`userId set to '${this.userId}'`);
  }
  private joinedRoom(data: object) {}
}
