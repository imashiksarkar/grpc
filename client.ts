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

// stream from the server
const sfs = client.SayHelloStream({ name: "Ashik" });

sfs.on("data", (response: any) => {
  console.log("📩 Stream message:", response.message);
});

sfs.on("end", () => {
  console.log("✅ Stream ended");
});

sfs.on("error", (err: any) => {
  console.error("❌ Stream error", err);
});

// stream to the server
const s2s = client.SendNamesStream((err: any, res: any) => {
  if (err) return console.error("❌ Server error:", err);
  console.log("🎉 Server response:", res.message);
});

["Ashik", "Sarkar", "BunJS"].forEach((name) => {
  s2s.write({ name });
});

s2s.end();
