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
var Netmask = require('netmask').Netmask;

if (process.argv.length !== 3) {
    console.error('Exactly one argument required');
    process.exit(1);
}


/* Global Variables */
var input = process.argv[2];
var output = "address_list_output.txt";

var addressList = [];

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

    for (var i = 0; i < _sentences.length; i++) {
        if (_sentences[i].indexOf("set address") >= 0) {
            _temp = _replaceAFMaddressList(_sentences[i]);
            _exit.push(_temp + "\n");
        }
    }

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
