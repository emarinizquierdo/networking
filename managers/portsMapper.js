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
        "tcp": { protocol : "tcp",
                    dst: true}
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
    }
}

var PortsMapper = function() {

    var that = this;

    var _mapList = knownPorts || {};

    this.add = function(name, protocol, src, dst) {

        _mapList[name] = _mapList[name] || {};

        _mapList[name][protocol] = _mapList[name][protocol] || {
            name : name,
            protocol : protocol,
            src: (src == "0-65535" || src == "1-65535") ? false : src,
            dst: (dst == "0-65535" || dst == "1-65535") ? false : dst
        }

    };

    this.exist = function(name) {

        return (typeof _mapList[name] != "undefined");

    };

    this.getPortMap = function(name) {
        return _mapList[name];
    }

    this.getProtocols = function( serviceList ){

        var _auxProtocolList = [];

        for(var i = 0; i < serviceList.length; i++){
            if(_mapList[serviceList[i]]){
                for(var _protocol in _mapList[serviceList[i]]){
                    if(_mapList[serviceList[i]].hasOwnProperty(_protocol)){
                        _mapList[serviceList[i]][_protocol].name = serviceList[i];
                        _auxProtocolList.push(_mapList[serviceList[i]][_protocol]);
                    }                    
                }
            }
        }

        return _auxProtocolList;

    }


}

module.exports.PortsMapper = PortsMapper;
