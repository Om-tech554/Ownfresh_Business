import tls from "tls";

const socket = tls.connect(443, "82.112.229.195", { rejectUnauthorized: false }, () => {
  const cert = socket.getPeerCertificate();
  console.log("Certificate Subject:", cert.subject);
  console.log("Certificate Issuer:", cert.issuer);
  console.log("Subject Alt Names (SAN):", cert.subjectaltname);
  console.log("Valid from:", cert.valid_from, "to:", cert.valid_to);
  socket.end();
});

socket.on("error", (err) => {
  console.error("TLS Socket error:", err);
});
