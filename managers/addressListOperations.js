// addressListOperations.js
//

function AddressListOperations(fs, portsMapper, serviceNamesMgr, Netmask) {

    var that = this;

    var OUTPUT_FILE = "outputs/address_list.txt";

    var _sentences = [];
    var _operations = [];

    this.extract = function(rawArray) {

        for (var i = 0; i < rawArray.length; i++) {
            if (rawArray[i].indexOf("set address") >= 0) {
                _sentences.push(rawArray[i]);
            }
        }
    }

    this.createOperations = function() {

        var _sentenceAsArray;

        for (var i = 0; i < _sentences.length; i++) {
            _sentenceAsArray = _sentences[i].split(" ");
            //Each Sentence is like this:  set address "Untrust" "147.96.14.73/32" 147.96.14.73 255.255.255.255 "dm borq ue"
            that.addOperation(_sentenceAsArray[3], _sentenceAsArray[4], _sentenceAsArray[5], _sentenceAsArray.slice(6, _sentenceAsArray.length).join(' ') );
        }

    };

    this.addOperation = function(addressName, ip, netmask, description) {

        var _tempOperation = [];

        _tempOperation.push("tmsh create security firewall address-list");
        _tempOperation.push("\"" + addressName.replace('/', '_') + "\"");

        try {
            if (ip == "0.0.0.0" && netmask == "0.0.0.0") {
                _tempOperation.push("{description \"" + description + "\" addresses add {0.0.0.0/0 {} }}");
            } else {
                block = new Netmask(ip, netmask);

                _tempOperation.push("{description \"" + description + "\" addresses add {" + ip + "/" + block.bitmask + "{} }}");
            }
        } catch (error) {
            console.log(error);
        }

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

module.exports.AddressListOperations = AddressListOperations;
