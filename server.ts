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
  // stream to the client
  SayHelloStream: (call: any) => {
    const { name } = call.request;

    let count = 0;
    const interval = setInterval(() => {
      count++;
      call.write({ message: `Hello ${name}, message #${count}` });

      if (count >= 5) {
        clearInterval(interval);
        call.end();
      }
    }, 1000);
  },
  // stream from the client
  SendNamesStream: (call: any, callback: any) => {
    const names: string[] = [];

    call.on("data", (req: any) => {
      console.log("📥 Received:", req.name);
      names.push(req.name);
    });

    call.on("end", () => {
      const message = `Hello to ${names.join(", ")}`;
      callback(null, { message });
    });

    call.on("error", (err: any) => {
      console.error("❌ Stream error:", err);
    });
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
