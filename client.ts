import grpc from "@grpc/grpc-js";

import { GreeterClient } from "./generated/helloworld_grpc_pb.js";
import { HelloRequest } from "./generated/helloworld_pb.js";

const client = new GreeterClient(
  "localhost:50051",
  grpc.credentials.createInsecure(),
);

const sayHello = () => {
  const req = new HelloRequest();
  req.setName("Ashik");

  client.sayHello(req, (err, res) => {
    if (err) throw err;

    console.log(res.getMessage());
  });
};

const sayHelloStream = () => {
  const req = new HelloRequest();
  req.setName("Ashik");

  const stream = client.sayHelloStream(req);

  stream.on("data", (res) => {
    console.log(res.getMessage());
  });

  stream.on("end", () => {
    console.log("stream ended");
  });
};

const sendNamesStream = () => {
  const stream = client.sendNamesStream((err, res) => {
    if (err) throw err;

    console.log(res.getMessage());
  });

  const r1 = new HelloRequest();
  r1.setName("Alice");

  const r2 = new HelloRequest();
  r2.setName("Bob");

  stream.write(r1);
  stream.write(r2);

  stream.end();
};

// sayHello()
// sayHelloStream()
// sendNamesStream();
