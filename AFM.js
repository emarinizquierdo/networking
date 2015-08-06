
/* Import javascript utils */
var fs = require('fs'),
    Netmask = require('netmask').Netmask;

/* Global Variables */
var OUTPUT_PORT_LIST = "port_list.txt",
    OUTPUT_KNOWN = "known_Service.txt",
    OUTPUT_PORT_LIST_GROUP = "port_listGroup.txt",
    OUTPUT_ADDRESS_LIST = "address_list_output.txt",
    OUTPUT_GROUP_ADDRESS_LIST = "address_group_list_output.txt",
    OUTPUT_RULE_LIST = "rule_list_output.txt";
    
var inputFile = process.argv[2],
    portList = [],
    _serviceName = {},
    _addressName = {},
    _rulelistname = {},
    _rulename = {},
    _setServicesSentences,
    _setServicesGroupSentences,
    _setGroupAddressSentences,
    _RuleSentences;

var tcpUdpMapping = {
    
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


/* End Global Variables */


/*
 * Main Logic
 */
 
function init(){
    
    //Check if we are passing file input name
    if (process.argv.length !== 3) {
        console.error('Exactly one argument required');
        process.exit(1);
    }

    // Read the entire file asynchronously, with a callback to process the file
    // with w's then write the result to the new file.
    fs.readFile(inputFile, 'utf-8', function(err, text) {
    
        //Posibles errores
        if (err) throw err;
    
        //1º Extraemos set service
        //2ªSacamos los set groups
        //3ª Quitamos de set service los que son =3 y quitamos lo que ya existe en set service y set group
    
        _setServicesSentences = _extractSetServiceSentences(text);
        _setServicesGroupSentences = _extractSetServiceGroupSentences(text);
        _setAddressSentences = _extractSetAddressSentences(text);
        _setGroupAddressSentences = _extractSetGroupAddressSentences(text);
        
        _RuleSentences = _extractRuleList(text);
        
        _RuleSentences = iterateOverSentences(_RuleSentences, _replaceAFMRuleList);
        
         
        _deleteSetServiceX(_setServicesSentences, function( port_list, know_list){
            
            _writeFile(OUTPUT_PORT_LIST, port_list);
            _writeFile(OUTPUT_KNOWN, know_list);
            _writeFile(OUTPUT_PORT_LIST_GROUP, _setServicesGroupSentences);
            _writeFile(OUTPUT_ADDRESS_LIST, _setAddressSentences);
            _writeFile(OUTPUT_GROUP_ADDRESS_LIST, _setGroupAddressSentences);
            _writeFile(OUTPUT_RULE_LIST, _RuleSentences);
        
        });
    
    
    });
    
}


function _writeFile(p_output, p_input){
    
    fs.writeFile(p_output, p_input.toString().replace(/,/g, ''), function(err) {
        if (err) throw err;
    });
    
}

/* Extraemos todos los set service */
function _extractSetServiceSentences(p_text) {

    var _sentences = p_text.split('\n');
    var _exit = [];

    for (var i = 0; i < _sentences.length; i++) {
        if (_sentences[i].indexOf("set service") >= 0) {
            _exit.push(_sentences[i]);
        }
    }

    return _exit;
}

/* Extraemos todos los set service group */
function _extractSetServiceGroupSentences(p_text) {

    var _sentences = p_text.split('\n');
    var _exit = [];
    var _sentence;

    for (var i = 0; i < _sentences.length; i++) {
        _sentence  = _sentences[i].split(" ");
        if (_sentences[i].indexOf("set group service") >= 0 && _sentence.length > 4){
            _serviceName[_sentence[2]] = true;
            _exit.push(_replaceAFMPortListGroup(_sentence) + "\n");
        }
    }

    return _exit;
}

/* Extraemos todos los set address */
function _extractSetAddressSentences(p_text) {

    var _sentences = p_text.split('\n');
    var _exit = [];

    for (var i = 0; i < _sentences.length; i++) {
        if (_sentences[i].indexOf("set address") >= 0) {
            _exit.push(_replaceAFMaddressList(_sentences[i]) + "\n");
        }
    }

    return _exit;
}

/* Extraemos todos los set group address */
function _extractSetGroupAddressSentences(p_text) {

    var _sentences = p_text.split('\n');
    var _exit = [];
    var _sentence;

    for (var i = 0; i < _sentences.length; i++) {
        _sentence  = _sentences[i].split(" ");
        if (_sentences[i].indexOf("set group address") >= 0 && _sentence.length > 5) {
            _exit.push(_replaceAFMaddressListGroup(_sentence) + "\n");
        }
    }

    return _exit;
}

function _extractRuleList(p_text){

    var _sentences = p_text.split('\n');
    var _tempSentences = [];
    var _setPolicyFound = false;
    var _setPolicyIndex = -1;
    var _lastExitFound = false;
    var _lastExitIndex = -1;
    var i = 0;
    
    while((i < _sentences.length) && !_setPolicyFound){
        if(_sentences[i].indexOf("set policy") >= 0){
            _setPolicyIndex = i;
            _setPolicyFound = true;
        }
        i++;
    }

    i = _setPolicyIndex;
    while((i < _sentences.length) && !_lastExitFound){
        if((_sentences[i].indexOf("exit") >= 0) && (_sentences[i+1].indexOf("set policy") < 0)){
            _lastExitIndex = i;
            _lastExitFound = true;
        }
        i++;
    }
    
    _tempSentences = _sentences.slice(_setPolicyIndex, _lastExitIndex).join("\n").split("exit");
    
    for(i = 0; i < _tempSentences.length; i++){
        _tempSentences[i] = _tempSentences[i].split("\n").filter(function(n){ return n !== '' });
    }
    
    return _tempSentences;
    
    
}

/* Eliminamos aquellas que únicamente tienen set service X */
function _deleteSetServiceX(p_sentences, p_callback) {

    var _sentenceAsArray;
    var _portList = [];
    var _knowList = [];

    for (var i = 0; i < p_sentences.length; i++) {

        _sentenceAsArray = p_sentences[i].split(" ");
        
        if ((_sentenceAsArray.length > 3) && ((_sentenceAsArray[4] == "tcp") || _sentenceAsArray[4] == "udp")) {
            _portList.push(_replaceAFMPortList(_sentenceAsArray));
            _serviceName[_sentenceAsArray[2]] = true;
        }else if(typeof _serviceName[_sentenceAsArray[2]] == "undefined"){
            _knowList.push(_replaceAFMKnowList(_sentenceAsArray) + "\n");
            _serviceName[_sentenceAsArray[2]] = true;
        }

    }

    p_callback(_portList, _knowList);

}

function _replaceAFMKnowList( p_sentence ){

    var _exit = [];

    // set service "ICMP-ANY"

    _exit.push("tmsh create security firewall port-list");
    _exit.push(p_sentence[2]);
    _exit.push("{}");
    _exit = _exit.join(" ");
    _exit += "\n";

    return _exit;
}

function _replaceAFMPortList( p_sentence ){

    var _exit = [];

    // set service "tcp-8080" protocol tcp src-port 1-65535 dst-port 8080-8080
    if(!tcpUdpMapping[p_sentence[2].replace(/'/g, '').replace(/"/g, '')]){
        tcpUdpMapping[p_sentence[2].replace(/'/g, '').replace(/"/g, '')] = {};
        tcpUdpMapping[p_sentence[2].replace(/'/g, '').replace(/"/g, '')][p_sentence[4]] = {"src-port" : p_sentence[6], "dst-port" : p_sentence[8]};
        _exit.push("tmsh create security firewall port-list");
    }else{
        tcpUdpMapping[p_sentence[2].replace(/'/g, '').replace(/"/g, '')][p_sentence[4]] = {"src-port" : p_sentence[6], "dst-port" : p_sentence[8]};
        _exit.push("tmsh modify security firewall port-list");
    }
    
    _exit.push(p_sentence[2]);
    _exit.push("{ports add {" + p_sentence[p_sentence.length - 2] + "}}"); //Aquí hay que meter un replace de 0- por 1-
    _exit.push(p_sentence[p_sentence.length - 1]);
    _exit = _exit.join(" ");
    _exit += "\n";
    
    return _exit;
}

function _replaceAFMaddressList(p_sentence) {

    var _exit = [];
    var block;
    var _
    p_sentence = p_sentence.split(" ");

    // set address "Untrust" "147.96.14.73/32" 147.96.14.73 255.255.255.255 "dm borq ue"

    /* TO REMOVE????
    var _aux = {};
    _aux[p_sentence[2]] = p_sentence[4];
    addressList.push(_aux);
    */
    
    _exit.push("tmsh create security firewall address-list");
    _exit.push(p_sentence[3].replace('/','_'));

    try {
        if (p_sentence[4] == "0.0.0.0" && p_sentence[5] == "0.0.0.0") {
            _exit.push("{description " + p_sentence.slice(6, p_sentence.length).join(' ') + " addresses add {0.0.0.0/0 {} }}");
        } else {
            block = new Netmask(p_sentence[4], p_sentence[5]);
            
            _exit.push("{description " + p_sentence.slice(6, p_sentence.length).join(' ') + " addresses add {" + p_sentence[4] + "/" + block.bitmask + "{} }}");
        }
    } catch (error) {
        console.log(error);
    }
    _exit = _exit.join(" ");

    return _exit;
}

function _replaceAFMPortListGroup( p_sentence ){

 var _exit = [];
    /* set group service "Acceso_Remoto"
    set group service "Acceso_Remoto" add "SSH"
    set group service "Acceso_Remoto" add "tcp-3389"
    set group service "Acceso_Remoto" add "TELNET"*/
    if ( !_serviceName[p_sentence[3]]) {
        _serviceName[p_sentence[3]] = true;
        _exit.push("tmsh create security firewall port-list");
        _exit.push(p_sentence[3]);
        _exit.push("{ port-lists add {");
        _exit.push(p_sentence[5]);
        _exit.push("{ } }}");
    } else {
        _exit.push("tmsh modify security firewall port-list");
        _exit.push(p_sentence[3]);
        _exit.push("{ port-lists add {");
        _exit.push(p_sentence[5]);
        _exit.push("{} }}");
    }

    _exit = _exit.join(" ");

    return _exit;
}

function _replaceAFMaddressListGroup(p_sentence) {

    var _exit = [];
    var block;

    /*set group address "Untrust" "a-altiris"
    set group address "Untrust" "a-altiris" add "147.96.4.103"
    set group address "Untrust" "a-altiris" add "147.96.4.121"
    set group address "Untrust" "a-altiris" add "147.96.4.65"
    set group address "Untrust" "a-altiris" add "147.96.4.87"
    */

    /* TO REMOVE????
    var _aux = {};
    _aux[p_sentence[2]] = p_sentence[4];
    addressListGroup.push(_aux);
    */

    if ( !_addressName[p_sentence[4]]) {
        _addressName[p_sentence[4]] = true;
        _exit.push("tmsh create security firewall address-list");
        _exit.push(p_sentence[4]);
        _exit.push("{ address add {");
        _exit.push(p_sentence[6]);
        _exit.push("{ } }}");
    } else {
        _exit.push("tmsh modify security firewall address-list");
        _exit.push(p_sentence[4]);
        _exit.push("{ address add {");
        _exit.push(p_sentence[6]);
        _exit.push("{} }}");
    }

    _exit = _exit.join(" ");

    return _exit;
}


function _replaceAFMRuleList( p_sentenceArray ){

    var _exit = [];

    /*set policy id 2381 from "WIFI-DISTRIBUCION" to "Administracion"  "n-re-portal" "s-si-DNS_admon" "DNS" permit 
    set policy id 2381 application "DNS"
    set policy id 2381
    set service https
    set service http
    set src-address "n-re-portal2"
    set dst-address
    exit*/
    
    var p_sentence = p_sentenceArray[0].replace(/\s+/g, ' ').split(' ');
    
    var _netScreenRule = {
        "origin_zone" : p_sentence[5],
        "destination_zone": p_sentence[7],
        "src-address" : [p_sentence[8]],
        "dst-address" : [p_sentence[9]],
        "service" : [p_sentence[10]]
    };
    
    _fillNetScreenRuleProperties( "service", _netScreenRule );
    _fillNetScreenRuleProperties( "src-address", _netScreenRule );
    _fillNetScreenRuleProperties( "dst-address", _netScreenRule );
    
    _netScreenRule.service = _transformServices(_netScreenRule.service);
    
    /* Ejemplo de salida intermedia
    
        { origin_zone: '"Administrativa-C"',
          destination_zone: '"Administracion"',
          'src-address': [ '"s-si-pantallas"', '"u-re-ucm_adm-C"' ],
          'dst-address': [ '"s-si-grafana"' ],
          service: [
             '"HTTP"',
             '"SSH"',
             '"tcp-5432"',
             '"tcp-8080-8084"',
             '"tcp-9200-9400"'
           ]
        }
    */
    
    console.log(_netScreenRule);
    
    function _fillNetScreenRuleProperties( p_property, p_netScreenRule ){
        
        if(p_sentenceArray.length === 0){
            return;
        }
        for(var i = 1; i < p_sentenceArray.length; i++){
            if(p_sentenceArray[i].indexOf("set " + p_property) >= 0){
                var _sentence = p_sentenceArray[i].split(" ");
                p_netScreenRule[p_property].push(_sentence[2]);
            }
        }
        
    }
    
    function _transformServices( p_services ){
        
        var _services = [];
        var _filteredKey;
        
        for(var i = 0; i < p_services.length; i++){
            _filteredKey = p_services[i].replace(/'/g, '').replace(/"/g, '');
            if(tcpUdpMapping[_filteredKey]){
                //si en la variable global de puertos es tcp o udp se pone tcp, oud  icpm.
                for(var key in tcpUdpMapping[_filteredKey]){
                    if(tcpUdpMapping[_filteredKey].hasOwnProperty(key) && tcpUdpMapping[_filteredKey][key]){
                        var _object = {};
                        _object[key] = _filteredKey;
                        _services.push(_object);
                    }   
                }
            }
        }
        
        return _services;
    }
    
    function _composeRuleList( p_netScreenRule ){
        
        var _ruleList = [];
        
        var _ruleName = "RL_" + (p_netScreenRule.origin_zone + "_" + p_netScreenRule.destination_zone).replace(/'/g, '').replace(/"/g, '');
        
        _ruleList.push("tmsh create security firewall rule-list");
        _ruleList.push(_ruleName);
        _ruleList.push("{rules add");
        
        _addRules(p_netScreenRule, _ruleList);
        
        _ruleList.push("}");
        
        
        
        return _ruleList;
        
    }
    
    function _addRules( p_nsr, p_rule){
        
        var _rule = [];
        
        for(var i = 0; i < p_nsr.services.length; i++){
            _rule.push("{")
        }
        
        
    }
    
    return "nada";
    
    /*
    var _RuleListName = "RL-" + p_sentence[5] + "_" + p_sentence[7];
    
    var p_sentence = p_sentenceArray[0];
    
    //la regla va desde set policy hasta exit... Hay que tratar todo en un bloque....
 
    //ver si hay puertos tcp o udp, si ambos hay que duplicar la regla!! Hay que meter source port y destination port!!! 
    var _RuleListName = "RL-" + p_sentence[5] + "_" + p_sentence[7];
    
    if(!_rulelistname[_RuleListName]){
        _rulelistname[_RuleListName] = true;
        
        _exit.push("tmsh create security firewall rule-list");
        _exit.push(_RuleListName);
        
    }else{
        _exit.push("tmsh modify security firewall rule-list");
        _exit.push(_RuleListName);
    }
    
    if(tcpUdpMapping[p_sentence[10]]){
        //si en la variable global de puertos es tcp o udp se pone tcp o udp.
        for(key in tcpUdpMapping[p_sentence[10]]){
            if(tcpUdpMapping[p_sentence[10]].hasOwnProperty(key) && tcpUdpMapping[p_sentence[10]][key]){
                _rulename= ( "R_" + p_sentence[3] + "_" + key)
            }   
        }
        
    }
    
    //este el nombre tiene que ser R_numero_Id_protocolo -> pero el numero_id tiene que ser de 4 digitos y cuando no lo sea completarlo con 0 a la izquierda
    _rulename= ( "R_" + p_sentence[3] + "_" + protocol);
    

    if (en bloque scr-address){
        
    }else if (en bloque dst-address){
        
    } else if (en bloque "set service")

    
    

    
    _exit.push("{ rules add { " + rulename);
    
    _exit.push(" { place_after last action }");
    if (p_sentence[11]=="permit"){
        _exit.push("accept");
    } else if (p_sentence[11]=="deny"){
        _exit.push("drop");
    }
    
    _exit.push(" ip-protocol "); //meter a continuación valor si udp o tcp de variable global de puertos
    _exit.push(" destination {address-lists add {" + p_sentence[9] + " port-lists add {" + p_sentence[10] + " }} source { address-lists add { " + p_sentence[8] + "} }}");
    
    //si dentro del bloque hay mas puertos o mas addresses hay que meter un tmsh modify
    
    _exit = _exit.join(" ");
    
    _exit += "\n"; 

    return _exit;*/
}


/*function _replaceAFMPolicy( p_sentence ){

    var _exit = [];

    // set policy id 2381 from "WIFI-DISTRIBUCION" to "Administracion" 

    //utilizar la variable anterior para meter los ids en cada politica!
    //si es la primera vez que aparece la zona create sino modify!!
    _exit.push("tmsh create security firewall POL-");
    _exit.push(p_sentence[5]);
    _exit.push("{ rules add {" + /VARIABLE zona destino/+ "{ rule-list " + VARIABLE zona origen + "place_after last }} }");

    _exit = _exit.join(" ");
    
    _exit += "\n";

    return _exit;
}*/

function iterateOverSentences(p_list, p_modifier){
    
    var _exit = [];
    
    for(var i = 0; i < p_list.length; i++){
        _exit.push(_replaceAFMRuleList(p_list[i]));
    }
    
    return _exit;
}

init();
