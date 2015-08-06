/*
 * This script reads a file and produces a new file like the original with all
 * the r's and l's replaced with w's.  The input file is assumed to be encoded
 * using UTF-8; the output file will also be UTF-8 encoded.  The new file's name
 * is formed from the input file name by appending a '.w'.
 *
 * For example, if the file 'greeting.txt' contained the text
 *
 *   Hello, how are you today?
 *
 * The executing
 *
 *   node fuddify.js greeting.txt
 *
 * will produce a new file named 'greeting.text.w' containing
 *
 *   Hewwo, how awe you today?
 */
var fs = require('fs');

if (process.argv.length !== 3) {
    console.error('Exactly one argument required');
    process.exit(1);
}


/* Global Variables */
var input = process.argv[2];
var output = "port_listGroup.txt";

var portListGroup = [];
var _serviceName = {};

/* End Global Variables */



// Read the entire file asynchronously, with a callback to replace the r's and l's
// with w's then write the result to the new file.
fs.readFile(input, 'utf-8', function(err, text) {

    //Posibles errores
    if (err) throw err;


    var _exit = _extractSetServiceSentences(text);

    fs.writeFile(output, _exit.toString().replace(/,/g, ''), function(err) {
        if (err) throw err;
    });


});

/* Extraemos todos los set service */
function _extractSetServiceSentences(p_text) {

    var _sentences = p_text.split('\n');
    var _exit = [];
    var _temp;
    var _sentence;

    for (var i = 0; i < _sentences.length; i++) {
        _sentence  = _sentences[i].split(" ");
        if (_sentences[i].indexOf("set group service") >= 0 && _sentence.length > 4){
            _temp = _replaceAFMportListGroup(_sentence);
            _exit.push(_temp + "\n");
        }
    }

    return _exit;
}

function _replaceAFMportListGroup( p_sentence ){

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