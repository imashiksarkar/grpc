import grpc from "@grpc/grpc-js";
import {
  GreeterService,
  type IGreeterServer,
} from "./generated/helloworld_grpc_pb.js";
import { HelloRequest, HelloReply } from "./generated/helloworld_pb.js";

class GreeterController implements IGreeterServer {
  [method: string]: grpc.UntypedHandleCall;

  sayHello: grpc.handleUnaryCall<HelloRequest, HelloReply> = (
    call,
    callback,
  ) => {
    const name = call.request.getName();
    const reply = new HelloReply();
    reply.setMessage(`Hello ${name}`);
    callback(null, reply);
  };

  sayHelloStream: grpc.handleServerStreamingCall<HelloRequest, HelloReply> = (
    call,
  ) => {
    const name = call.request.getName();
    let count = 0;

    const interval = setInterval(() => {
      count++;
      const reply = new HelloReply();
      reply.setMessage(`Hello ${name} #${count}`);
      call.write(reply);

      if (count >= 5) {
        clearInterval(interval);
        call.end();
      }
    }, 1000);
  };

  sendNamesStream: grpc.handleClientStreamingCall<HelloRequest, HelloReply> = (
    call,
    callback,
  ) => {
    const names: string[] = [];

    call.on("data", (req) => names.push(req.getName()));
    call.on("end", () => {
      const reply = new HelloReply();
      reply.setMessage(`Hello ${names.join(", ")}`);
      callback(null, reply);
    });
  };
}

const server = new grpc.Server();
const controller = new GreeterController();

server.addService(GreeterService, controller);

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) throw err;
    console.log(`Server running on port ${port}`);
  },
);
