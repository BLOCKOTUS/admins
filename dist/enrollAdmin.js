"use strict";

require("core-js/modules/es.array.join");

require("core-js/modules/es.object.to-string");

require("core-js/modules/es.promise");

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.main = void 0;

require("regenerator-runtime/runtime");

var _fabricNetwork = require("fabric-network");

var _fabricCaClient = _interopRequireDefault(require("fabric-ca-client"));

var _fs = _interopRequireDefault(require("fs"));

var _path = _interopRequireDefault(require("path"));

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { "default": obj }; }

function asyncGeneratorStep(gen, resolve, reject, _next, _throw, key, arg) { try { var info = gen[key](arg); var value = info.value; } catch (error) { reject(error); return; } if (info.done) { resolve(value); } else { Promise.resolve(value).then(_next, _throw); } }

function _asyncToGenerator(fn) { return function () { var self = this, args = arguments; return new Promise(function (resolve, reject) { var gen = fn.apply(self, args); function _next(value) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "next", value); } function _throw(err) { asyncGeneratorStep(gen, resolve, reject, _next, _throw, "throw", err); } _next(undefined); }); }; }

/**
 * Enroll an admin with `admin` username.
 */
var main = /*#__PURE__*/function () {
  var _ref = _asyncToGenerator( /*#__PURE__*/regeneratorRuntime.mark(function _callee() {
    var ccpPath, ccp, caInfo, caTLSCACerts, ca, walletPath, wallet, identity, enrollment, x509Identity;
    return regeneratorRuntime.wrap(function _callee$(_context) {
      while (1) {
        switch (_context.prev = _context.next) {
          case 0:
            // load the network configuration
            ccpPath = _path["default"].resolve(__dirname, '..', '..', '..', '..', 'network', 'organizations', 'peerOrganizations', 'org1.example.com', 'connection-org1.json');
            ccp = JSON.parse(_fs["default"].readFileSync(ccpPath, 'utf8')); // Create a new CA client for interacting with the CA.

            caInfo = ccp.certificateAuthorities['ca.org1.example.com'];
            caTLSCACerts = caInfo.tlsCACerts.pem;
            ca = new _fabricCaClient["default"](caInfo.url, {
              trustedRoots: caTLSCACerts,
              verify: false
            }, caInfo.caName); // Create a new file system based wallet for managing identities.

            walletPath = _path["default"].join(__dirname, '..', '..', '..', '..', 'wallet');
            _context.next = 8;
            return _fabricNetwork.Wallets.newFileSystemWallet(walletPath);

          case 8:
            wallet = _context.sent;
            _context.next = 11;
            return wallet.get('admin');

          case 11:
            identity = _context.sent;

            if (!identity) {
              _context.next = 14;
              break;
            }

            throw new Error("An identity for the user admin already exists in the wallet");

          case 14:
            _context.next = 16;
            return ca.enroll({
              enrollmentID: 'admin',
              enrollmentSecret: 'adminpw'
            });

          case 16:
            enrollment = _context.sent;
            x509Identity = {
              credentials: {
                certificate: enrollment.certificate,
                privateKey: enrollment.key.toBytes()
              },
              mspId: 'Org1MSP',
              type: 'X.509'
            };
            _context.next = 20;
            return wallet.put("admin", x509Identity);

          case 20:
            return _context.abrupt("return");

          case 21:
          case "end":
            return _context.stop();
        }
      }
    }, _callee);
  }));

  return function main() {
    return _ref.apply(this, arguments);
  };
}();

exports.main = main;