import grpc from "@grpc/grpc-js";
import {
  GreeterService,
  type IGreeterServer,
} from "./generated/helloworld_grpc_pb.js";
import { HelloRequest, HelloReply } from "./generated/helloworld_pb.js";

const PORT = 50051;

const server = new grpc.Server();

const greeterService: IGreeterServer = {
  // Unary
  sayHello(
    call: grpc.ServerUnaryCall<HelloRequest, HelloReply>,
    callback: grpc.sendUnaryData<HelloReply>,
  ) {
    const name = call.request.getName();

    const reply = new HelloReply();
    reply.setMessage(`Hello, ${name}`);

    callback(null, reply);
  },

  // Server stream
  sayHelloStream(call: grpc.ServerWritableStream<HelloRequest, HelloReply>) {
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
  },

  // Client stream
  sendNamesStream(
    call: grpc.ServerReadableStream<HelloRequest, HelloReply>,
    callback: grpc.sendUnaryData<HelloReply>,
  ) {
    const names: string[] = [];

    call.on("data", (req: HelloRequest) => {
      names.push(req.getName());
    });

    call.on("end", () => {
      const reply = new HelloReply();
      reply.setMessage(`Hello ${names.join(", ")}`);

      callback(null, reply);
    });
  },
};

server.addService(GreeterService, greeterService);

server.bindAsync(
  `0.0.0.0:${PORT}`,
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) throw err;
    console.log(`gRPC server running at http://0.0.0.0:${port}`);
  },
);
