
var fs = require('fs');

if (process.argv.length !== 3) {
    console.error('Exactly one argument required');
    process.exit(1);
}


/* Global Variables */
var input = process.argv[2];
var outputPortList = "port_list.txt";
var outputKnown = "known_Service.txt";
var outputPortListGroup = "port_listGroup.txt";

var portList = [];

var _serviceName = {};

/* End Global Variables */


var _setServicesSentences,
    _setServicesGroupSentences;


// Read the entire file asynchronously, with a callback to replace the r's and l's
// with w's then write the result to the new file.
fs.readFile(input, 'utf-8', function(err, text) {

    //Posibles errores
    if (err) throw err;

    //1º Extraemos set service
    //2ªSacamos los set groups
    //3ª Quitamos de set service los que son =3 y quitamos lo que ya existe en set service y set group

    _setServicesSentences = _extractSetServiceSentences(text);
    _setServicesGroupSentences = _extractSetServiceGroupSentences(text);
    
    _deleteSetServiceX(_setServicesSentences, function( port_list, know_list){
        
        _writeFile(outputPortList, port_list);
        _writeFile(outputKnown, know_list);
        _writeFile(outputPortListGroup, _setServicesGroupSentences);
    
    });


});

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

/* Eliminamos aquellas que únicamente tienen set service X */
function _deleteSetServiceX(p_sentences, p_callback) {

    var _sentenceAsArray;
    var _portList = [];
    var _knowList = [];
    var _temp; 

    for (var i = 0; i < p_sentences.length; i++) {

        _sentenceAsArray = p_sentences[i].split(" ");
        
        if (_sentenceAsArray.length > 3) {
            _temp = _replaceAFMPortList(_sentenceAsArray);
            _portList.push(_temp);
            _serviceName[_sentenceAsArray[2]] = true;
        }else if(typeof _serviceName[_sentenceAsArray[2]] == "undefined"){
            _knowList.push(p_sentences[i] + "\n");
            _serviceName[_sentenceAsArray[2]] = true;
        }

    }

    p_callback(_portList, _knowList);

}


function _replaceAFMPortList( p_sentence ){

    var _exit = [];

    // set service "tcp-8080" protocol tcp src-port 1-65535 dst-port 8080-8080
    var _aux = {};
    _aux[p_sentence[2]] = p_sentence[4];
    portList.push(_aux);

    _exit.push("tmsh create security firewall port-list");
    _exit.push(p_sentence[2]);
    _exit.push("{ports add {" + p_sentence[p_sentence.length - 2] + "}}");
    _exit.push(p_sentence[p_sentence.length - 1]);

    _exit = _exit.join(" ");
    
    _exit += "\n";

    return _exit;
}


/* Extraemos todos los set service */
function _extractSetServiceGroupSentences(p_text) {

    var _sentences = p_text.split('\n');
    var _exit = [];
    var _temp;
    var _sentence;

    for (var i = 0; i < _sentences.length; i++) {
        _sentence  = _sentences[i].split(" ");
        if (_sentences[i].indexOf("set group service") >= 0 && _sentence.length > 4){
            _serviceName[_sentence[2]] = true;
            _temp = _replaceAFMPortListGroup(_sentence);
            _exit.push(_temp + "\n");
        }
    }

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
