// portsMapper.js
//
var knownPorts = {

    "ICMP-ANY": {
        "icmp": { protocol : "icmp" }
    },
    "IPSEC_ESP": {
        "50": { protocol : "50" }
    },
    "Protocol_AH": {
        "51": { protocol : "51" }
    },
    "Protocol_41": {
        "41": { protocol : "41" }
    },
    "SSH": {
        "tcp": { protocol : "tcp" }
    },
    "SMB": {
        "tcp": { protocol : "tcp" }
    },
    "HTTPS": {
        "tcp": { protocol : "tcp" }
    },
    "SNMP": {
        "tcp": { protocol : "tcp" },
        "udp": { protocol : "udp" }
    },
    "SMTP": {
        "tcp": { protocol : "tcp" }
    },
    "SUN-RPC-PORTMAPPER": {
        "tcp": { protocol : "tcp" },
        "udp": { protocol : "udp" }
    },
    "RTSP": {
        "tcp": { protocol : "tcp" }
    },
    "DNS": {
        "tcp": { protocol : "tcp" },
        "upd": { protocol : "udp" },
    },
    "DHCP-Relay": {
        "udp": { protocol : "udp" }
    },
    "LDAP": {
        "tcp": { protocol : "tcp" }
    },
    "MS-RPC-EPM": {
        "tcp": { protocol : "tcp" },
        "udp": { protocol : "udp" }
    },
    "NTP": {
        "tcp": { protocol : "tcp" },
        "udp": { protocol : "udp" }
    },
    "TELNET": {
        "tcp": { protocol : "tcp" }
    },
    "HTTP": {
        "tcp": { protocol : "tcp" }
    },
    "PPTP": {
        "tcp": { protocol : "tcp" }
    },
    "IMAP": {
        "tcp": { protocol : "tcp" }
    },
    "POP3": {
        "tcp": { protocol : "tcp" }
    },
    "TFTP": {
        "udp": { protocol : "udp" }
    },
    "SYSLOG": {
        "udp": { protocol : "udp" }
    },
    "VNC": {
        "tcp": { protocol : "tcp" }
    },
}

var PortsMapper = function(knownPorts) {

    var that = this;

    var _mapList = knownPorts || {};

    this.add = function(name, protocol, src, dst) {

        _mapList[name] = _mapList[name] || {};

        _mapList[name][protocol] = _mapList[name][protocol] || {
            protocol : protocol,
            src: src,
            dst: dst
        }

    };

    this.exist = function(name) {

        return (typeof _mapList[name] != "undefined") ? true : false;

    };

    this.getPortMap = function(name) {
        return _mapList[name];
    }

}

module.exports.PortsMapper = PortsMapper;
