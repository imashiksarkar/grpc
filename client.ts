import grpc from "@grpc/grpc-js";
import protoLoader from "@grpc/proto-loader";

const packageDef = protoLoader.loadSync("./helloworld.proto");
const grpcObj = grpc.loadPackageDefinition(packageDef) as any;
const greeter = grpcObj.helloworld;

const client = new greeter.Greeter(
  "localhost:50051",
  grpc.credentials.createInsecure()
);

// Call the RPC
client.SayHello({ name: "Ashik" }, (err: any, res: any) => {
  if (err) return console.error(err);
  console.log("🎉 Response from server:", res.message);
});
