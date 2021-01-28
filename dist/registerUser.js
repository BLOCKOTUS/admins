"use strict";

require("core-js/modules/es.array.join");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = void 0;

require("regenerator-runtime/runtime");

var _fabricCaClient = _interopRequireDefault(require("fabric-ca-client"));

var _fabricNetwork = require("fabric-network");

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Register a new user in the network and creates a wallet file.
 * 
 * @param {string} username
 */
var main = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee(username) {
    var ccpPath, ccp, caURL, ca, walletPath, wallet, userIdentity, adminIdentity, provider, adminUser, secret, enrollment, x509Identity, newUser;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // load the network configuration
            ccpPath = _path["default"].resolve(__dirname, '..', '..', '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            ccp = JSON.parse(_fs["default"].readFileSync(ccpPath, 'utf8')); // Create a new CA client for interacting with the CA.

            caURL = ccp.certificateAuthorities['ca.org1.example.com'].url;
            ca = new _fabricCaClient["default"](caURL); // Create a new file system based wallet for managing identities.

            walletPath = _path["default"].join(__dirname, '..', '..', '..', 'wallet');
            _context.next = 7;
            return _fabricNetwork.Wallets.newFileSystemWallet(walletPath);

          case 7:
            wallet = _context.sent;
            _context.next = 10;
            return wallet.get(username);

          case 10:
            userIdentity = _context.sent;

            if (!userIdentity) {
              _context.next = 13;
              break;
            }

            throw new Error("An identity for the user \"".concat(username, "\" already exists in the wallet"));

          case 13:
            _context.next = 15;
            return wallet.get('admin');

          case 15:
            adminIdentity = _context.sent;

            if (adminIdentity) {
              _context.next = 18;
              break;
            }

            throw new Error("An identity for the admin user \"admin\" does not exist in the wallet");

          case 18:
            // build a user object for authenticating with the CA
            provider = wallet.getProviderRegistry().getProvider(adminIdentity.type);
            _context.next = 21;
            return provider.getUserContext(adminIdentity, 'admin');

          case 21:
            adminUser = _context.sent;
            _context.next = 24;
            return ca.register({
              affiliation: 'org1.department1',
              enrollmentID: username,
              role: 'client'
            }, adminUser);

          case 24:
            secret = _context.sent;
            _context.next = 27;
            return ca.enroll({
              enrollmentID: username,
              enrollmentSecret: secret
            });

          case 27:
            enrollment = _context.sent;
            x509Identity = {
              credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes()
              },
              mspId: 'Org1MSP',
              type: 'X.509'
            };
            _context.next = 31;
            return wallet.put(username, x509Identity);

          case 31:
            _context.next = 33;
            return provider.getUserContext(x509Identity, username);

          case 33:
            newUser = _context.sent;
            return _context.abrupt("return", newUser);

          case 35:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function main(_x) {
    return _ref.apply(this, arguments);
  };
}();

exports.main = main;