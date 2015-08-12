// ruleListManager.js
//

var RuleListManager = function(portsMapper) {

    var that = this;

    var _ruleList = {};
    var _ruleListGenerated = [];

    this.add = function(name, id, srcAddress, dstAddress, service, permissions) {

        if (!that.exist(name)) {
            _ruleList[name] = {};
            _ruleList[name][id] = {
                "src-address": (srcAddress) ? [srcAddress] : [],
                "dst-address": (dstAddress) ? [dstAddress] : [],
                "service": (service) ? [service] : [],
                "permission": permissions
            };

        } else if(!_ruleList[name][id]){

            _ruleList[name][id] = {
                "src-address": (srcAddress) ? [srcAddress] : [],
                "dst-address": (dstAddress) ? [dstAddress] : [],
                "service": (service) ? [service] : [],
                "permission": permissions
            };

        }else{

            _ruleList[name][id]["src-address"] = (srcAddress) ? _ruleList[name][id]["src-address"].push(srcAddress) : _ruleList[name][id]["src-address"];
            _ruleList[name][id]["dst-address"] = (dstAddress) ? _ruleList[name][id]["dst-address"].push(dstAddress) : _ruleList[name][id]["dst-address"];
            _ruleList[name][id].service = (service) ? _ruleList[name][id].service.push(service) : _ruleList[name][id].service;
            _ruleList[name][id].permission = (permissions) ? _ruleList[name][id].permissions : _ruleList[name][id].permissions;

        }

    };

    this.setService = function(name, id, service) {

        if (that.exist(name)) {
            _ruleList[name][id].service.push(service);
        }

    }

    this.setSrcAddress = function(name, id, srcAddress) {

        if (that.exist(name)) {
            _ruleList[name][id]["src-address"].push(srcAddress);
        }

    }

    this.setDstAddress = function(name, id, dstAddress) {

        if (that.exist(name)) {
            _ruleList[name][id]["dst-address"].push(dstAddress);
        }

    }

    this.exist = function(name) {

        return (typeof _ruleList[name] != "undefined");

    };

    this.generateRules = function() {

        var _tempRuleList = [];
        var _formattedRuleId;
        var _action;
        var _ruleOperation;

        for (var ruleListName in _ruleList) {
            if (_ruleList.hasOwnProperty(ruleListName)) {

                for (var ruleId in _ruleList[ruleListName]) {
                    if (_ruleList[ruleListName].hasOwnProperty(ruleId)) {

                        var _tempProtocolCheck ={};

                        _ruleList[ruleListName][ruleId].service = portsMapper.getProtocols(_ruleList[ruleListName][ruleId].service);

                        for (var i = 0; i < _ruleList[ruleListName][ruleId].service.length; i++) {

                            var _tempKey = _ruleList[ruleListName][ruleId].service[i].protocol;
                            
                            if(!_tempProtocolCheck[_tempKey]){
                                _tempProtocolCheck[_tempKey] = true;
                                _tempRuleList.push("tmsh create security firewall rule-list \"" + ruleListName + "\" { rules add \n");
                            }else{
                                _tempRuleList.push("tmsh modify security firewall rule-list \"" + ruleListName + "\" { rules add \n");
                            }

                            _formattedRuleId = (ruleId.length < 4) ? "R_0" + ruleId + "_" + _ruleList[ruleListName][ruleId].service[i].protocol : "R_" + ruleId + "_" + _ruleList[ruleListName][ruleId].service[i].protocol;
                            _action = (_ruleList[ruleListName][ruleId].permission == "permit") ? "accept" : "drop";

                            _tempRuleList.push("{ \"" + _formattedRuleId + "\" { place_after last action " + _action + " ip-protocol ");

                            _tempRuleList.push( _ruleList[ruleListName][ruleId].service[i].protocol + " "); //translate from knowListMngr

                            _tempRuleList.push("destination { address-lists add { ");


                            for(var j= 0; j < _ruleList[ruleListName][ruleId]["dst-address"].length; j++) {
                                _tempRuleList.push(" \"" + _ruleList[ruleListName][ruleId]["dst-address"][j] + "\"");
                            }

                            _tempRuleList.push(" } ");

                            if(_ruleList[ruleListName][ruleId].service[i].dst){

                                _tempRuleList.push("port-lists add { \"" + _ruleList[ruleListName][ruleId].service[i].name + "\" }} ");

                            }
                            
                            _tempRuleList.push("source { address-list add { ");

                            for(var j= 0; j < _ruleList[ruleListName][ruleId]["src-address"].length; j++) {
                                _tempRuleList.push(" \"" + _ruleList[ruleListName][ruleId]["src-address"][j] + "\"");
                            }

                            _tempRuleList.push(" } ");


                            if(_ruleList[ruleListName][ruleId].service[i].src){
                                _tempRuleList.push("port-lists add { \"" + _ruleList[ruleListName][ruleId].service[i].name + "\" }");
                            }

                            _tempRuleList.push("} }\n");

                        }

                    }
                }

                _tempRuleList.push("\n");

                _tempRuleList.join(" ");

                _ruleListGenerated.push(_tempRuleList);
            }
        }

        return _ruleListGenerated;
    }

}

module.exports.RuleListManager = RuleListManager;
