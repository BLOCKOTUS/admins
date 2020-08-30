/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Wallets } = require('fabric-network');
const FabricCAServices = require('fabric-ca-client');
const fs = require('fs');
const path = require('path');

async function main(id) {
    // load the network configuration
    const ccpPath = path.resolve(__dirname, '..', '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
    const ccp = JSON.parse(fs.readFileSync(ccpPath, 'utf8'));

    // Create a new CA client for interacting with the CA.
    const caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
    const ca = new FabricCAServices(caURL);

    // Create a new file system based wallet for managing identities.
    const walletPath = path.join(__dirname, '..', '..', 'wallet');
    const wallet = await Wallets.newFileSystemWallet(walletPath);
    console.log(`Wallet path: ${walletPath}`);

    // Check to see if we've already enrolled the user.
    const userIdentity = await wallet.get(id);
    if (userIdentity) throw new Error(`An identity for the user "${id}" already exists in the wallet`);

    // Check to see if we've already enrolled the admin user.
    const adminIdentity = await wallet.get('admin');
    if (!adminIdentity)  throw new Error(`An identity for the admin user "admin" does not exist in the wallet`);

    // build a user object for authenticating with the CA
    const provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
    const adminUser = await provider.getUserContext(adminIdentity, 'admin');

    // Register the user, enroll the user, and import the new identity into the wallet.
    const secret = await ca.register({
        affiliation: 'org1.department1',
        enrollmentID: id,
        role: 'client'
    }, adminUser);
    
    const enrollment = await ca.enroll({
        enrollmentID: id,
        enrollmentSecret: secret
    });
    
    const x509Identity = {
        credentials: {
            certificate: enrollment.certificate,
            privateKey: enrollment.key.toBytes(),
        },
        mspId: 'Org1MSP',
        type: 'X.509',
    };

    await wallet.put(id, x509Identity);
    
    console.log(`Successfully registered and enrolled client user "${id}" and imported it into the wallet`);
    
    return true;
}

const args = process.argv.slice(2);
const id = args[args.indexOf('-id') + 1];

if(id) main(id);

module.exports = { main }