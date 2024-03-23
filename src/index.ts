import { DropArgument, Server, Socket } from "net";

type ConnectionServerOptions = {
  port: number;
};

type ConnectionEvent = "close" | "connection" | "error" | "listening" | "drop";

class SocketHandler {
  connections: Map<string, Socket> = new Map();

  constructor() {}

  new(socket: Socket) {
    const id = socket.remoteAddress + ":" + socket.remotePort;
    this.connections.set(id, socket);
    socket.on("close", () => {
      this.connections.delete(id);
    });
  }
}

class ConnectionServer extends Server {
  private port: number;
  private socketHandler: SocketHandler;

  constructor(options: ConnectionServerOptions) {
    super();
    this.port = options.port;
    super.listen(this.port);

    this.socketHandler = new SocketHandler();
  }

  override on(event: "close", listener: () => void): this;
  override on(event: "connection", listener: (socket: Socket) => void): this;
  override on(event: "error", listener: (err: Error) => void): this;
  override on(event: "listening", listener: () => void): this;
  override on(event: "drop", listener: (data?: DropArgument) => void): this;
  override on(event: ConnectionEvent): this {
    switch (event) {
      case "close":
        console.log("Server is closing. All connections ended.");
        break;
      case "connection":
        super.on(event, (socket: Socket) => {
          this.socketHandler.new(socket);
        });
        break;
      case "error":
        super.on(event, (err: Error) => {
          console.error(err);
        });
        break;
      case "listening":
        console.log(`Server is listening on port ${this.port}`);
        break;
      case "drop":
        super.on(event, (data?: DropArgument) => {
          console.log("Connection dropped", data);
        });
        break;
    }

    return this;
  }
}

const server = new ConnectionServer({ port: 3000 });
