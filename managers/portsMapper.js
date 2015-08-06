// portsMapper.js
//
var knownPorts = {
    
    "ICMP-ANY" : {
        "icmp" : true
    },
    "IPSEC_ESP" :{
        "50" : true
    },
    "Protocol_AH" : {
        "51" : true
    },
    "Protocol_41" : {
        "41" : true
    },
    "SSH" : {
        "tcp" : true
    },
    "SMB" : {
        "tcp" : true
    },
    "HTTPS" : {
        "tcp" : true
    },
    "SNMP" : {
        "tcp" : true,
        "udp" : true
    },
    "SMTP" : {
        "tcp" : true
    },
    "SUN-RPC-PORTMAPPER" : {
        "tcp" : true,
        "udp" : true
    },
    "RTSP" : {
        "tcp" : true
    },
    "DNS" : {
        "tcp" : true,
        "upd" : false,
    },
    "DHCP-Relay" : {
        "udp" : true
    },
    "LDAP" : {
        "tcp" : true
    },
    "MS-RPC-EPM" : {
        "tcp" : true,
        "udp" : true
    },
    "NTP" : {
        "tcp" : true,
        "udp" : true
    },
    "TELNET" : {
        "tcp" : true
    },
    "HTTP" : {
        "tcp" : true
    },
    "PPTP" : {
        "tcp" : true
    },
    "IMAP" : {
        "tcp" : true
    },
    "POP3" : {
        "tcp" : true
    },
    "TFTP" : {
        "udp" : true
    },
    "SYSLOG" : {
        "udp" : true
    },
    "VNC" : {
        "tcp" : true
    },
}

var PortsMapper = function(knownPorts){
    
    var that = this;
    
    var _mapList = knownPorts || {};
    
    this.add = function( name, protocol, src, dst){
        
        
    };
    
    this.exist = function(name){
        
        return ( typeof _mapList[name] != "undefined" ) ? true : false;
        
    };

    this.getPortMap = function( portName ){
        return _mapList[portName];
    }
    
}

module.exports.PortsMapper = PortsMapper;