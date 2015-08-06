// addressListGroupOperations.js
//

function AddressListGroupOperations(fs, portsMapper, serviceNamesMgr) {

    var that = this;

    var OUTPUT_FILE = "outputs/address_list_group.txt";

    var _sentences = [];
    var _operations = [];
    var _addressName = {};

    this.extract = function(rawArray) {

        var _sentence;

        for (var i = 0; i < rawArray.length; i++) {
            _sentence = rawArray[i].split(" ");
            if ((rawArray[i].indexOf("set group address") >= 0) && (_sentence.length > 5)) {
                serviceNamesMgr.add(_sentence[2]);
                _sentences.push(rawArray[i]);
            }
        }
    }

    this.createOperations = function() {

        var _sentenceAsArray;

        for (var i = 0; i < _sentences.length; i++) {
            _sentenceAsArray = _sentences[i].split(" ");
            /*Each Sentence can be like one of this:
            set group address "Untrust" "a-altiris"
            set group address "Untrust" "a-altiris" add "147.96.4.103"
            set group address "Untrust" "a-altiris" add "147.96.4.121"
            set group address "Untrust" "a-altiris" add "147.96.4.65"
            set group address "Untrust" "a-altiris" add "147.96.4.87" */
            that.addOperation(_sentenceAsArray[4], _sentenceAsArray[6]);
        }

    };

    this.addOperation = function(addressName, address) {

        var _tempOperation = [];
        var _operation;

        if (typeof _addressName[addressName] == "undefined") {
            _addressName[addressName] = true;
            _operation = "create";
        }else{
            _operation = "modify";
        }

        _tempOperation.push("tmsh " + _operation + " security firewall address-list");
        _tempOperation.push("\"" + addressName + "\"");
        _tempOperation.push("{ port-lists add { " + address + " { } }}");
        _tempOperation = _tempOperation.join(" ");

        _operations.push(_tempOperation);

    };

    this.save = function() {
        var _stringToSave = _operations.join('\n').toString().replace(/,/g, '');
        fs.writeFile(OUTPUT_FILE, _stringToSave, function(err) {
            if (err) throw err;
        });
    };

}

module.exports.AddressListGroupOperations = AddressListGroupOperations;
