import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("./helloworld.proto");
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;

const greeter = grpcObj.helloworld;

const server = new grpc.Server();

server.addService(greeter.Greeter.service, {
  SayHello: (call: any, callback: any) => {
    console.log(call.request);
    callback(null, { message: `Hello, ${call.request.name}` });
  },
});

server.bindAsync(
  "0.0.0.0:50051",
  grpc.ServerCredentials.createInsecure(),
  (err, port) => {
    if (err) return console.error(err);
    console.log(`gRPC server running at port ${port}`);
  }
);
