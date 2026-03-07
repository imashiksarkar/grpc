import grpc from "@grpc/grpc-js";
import { GreeterService } from "./generated/helloworld_grpc_pb.js";
import { HelloReply, HelloRequest } from "./generated/helloworld_pb.js";

interface IGreeterController {
  sayHello: grpc.handleUnaryCall<HelloRequest, HelloReply>;
  sayHelloStream: grpc.handleServerStreamingCall<HelloRequest, HelloReply>;
  sendNamesStream: grpc.handleClientStreamingCall<HelloRequest, HelloReply>;
}

class GreeterController implements IGreeterController {
  [method: string]: grpc.UntypedHandleCall;

  sayHello: IGreeterController["sayHello"] = (call, callback) => {
    const name = call.request.getName();
    const reply = new HelloReply();
    reply.setMessage(`Hello ${name}`);
    reply.setVersion(1);
    callback(null, reply);
  };

  sayHelloStream: IGreeterController["sayHelloStream"] = (call) => {
    const name = call.request.getName();
    let count = 0;

    const interval = setInterval(() => {
      count++;
      const reply = new HelloReply();
      reply.setMessage(`Hello ${name} #${count}`);
      // reply.setVersion(1);
      call.write(reply);

      if (count >= 5) {
        clearInterval(interval);
        call.end();
      }
    }, 1000);
  };

  sendNamesStream: IGreeterController["sendNamesStream"] = (call, callback) => {
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
