// © Microsoft Corporation. All rights reserved.

/**
 * This script generates a self signed cert for localhost.msn.com and creates the certificate and
 * RSA private key files under `ssl` folder.
 *
 * This script is invoked as part of SetupSSLCert.ps1. If you are executing this directly, make sure to import
 * `localhost.crt` into Trusted Root Certification Authority cert folder to avoid cert error in the browser.
 */

const selfSigned = require("selfsigned");
const fs = require("fs");

const attributes = [{
    name: "commonName",
    value: "localhost.msn.com"
}];

// Domains to be added to SubjectAltName
const domains = [
    "localhost",
    "localhost.msn.com"
];

// Refer npm package documentation for options
const options = {
    algorithm: "sha256",
    keySize: 2048,
    days: 365 * 5,
    extensions: [
        { name: "basicConstraints", cA: true },
        {
            name: "keyUsage",
            keyCertSign: true,
            digitalSignature: true,
            nonRepudiation: true,
            keyEncipherment: true,
            dataEncipherment: true
        },
        {
            name: "subjectAltName",
            altNames: domains.map((altName) => { return { type: 2, value: altName }; })
        }
    ]
};

const pems = selfSigned.generate(attributes, options);

fs.writeFileSync("localhost.key", pems.private);
fs.writeFileSync("localhost.crt", pems.cert);