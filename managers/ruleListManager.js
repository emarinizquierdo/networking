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
                "src-address": [srcAddress],
                "dst-address": [dstAddress],
                "service": [service],
                "permission": permissions
            };

        } else {

            _ruleList[name][id] = {
                "src-address": [srcAddress],
                "dst-address": [dstAddress],
                "service": [service],
                "permission": permissions
            };
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

        for (var ruleListName in _ruleList) {
            if (_ruleList.hasOwnProperty(ruleListName)) {

                _tempRuleList.push("tmsh create security firewall rule-list \"" + ruleListName + "\" { rules add \n");

                for (var ruleId in _ruleList[ruleListName]) {
                    if (_ruleList[ruleListName].hasOwnProperty(ruleId)) {

                        for (var i = 0; i < _ruleList[ruleListName][ruleId].service.length; i++) {

                            _formattedRuleId = (ruleId.length < 4) ? "R_0" + ruleId : "R_" + ruleId;
                            _action = (_ruleList[ruleListName][ruleId].permission == "permit") ? "accept" : "drop";

                            _tempRuleList.push("{ \"" + _formattedRuleId + "\" { place_after last action " + _action + " ip-protocol ");

                            _tempRuleList.push(_ruleList[ruleListName][ruleId].service[i]); //translate from knowListMngr

                            _tempRuleList.push(" destination { address-lists add { ");

                            for(var j= 0; j < _ruleList[ruleListName][ruleId]["dst-address"].length; j++) {
                                _tempRuleList.push(_ruleList[ruleListName][ruleId]["dst-address"][i]);
                            }

                            _tempRuleList.push(" } port-lists add { " + _ruleList[ruleListName][ruleId].service[i] + " }}");

                            _tempRuleList.push("source { address-list add { ");

                            for(var j= 0; j < _ruleList[ruleListName][ruleId]["dst-address"].length; j++) {
                                _tempRuleList.push(_ruleList[ruleListName][ruleId]["dst-address"][i]);
                            }

                            _tempRuleList.push("} port-lists add {  }}")

                            _tempRuleList.push("\n");

                        }

                    }
                }

                _tempRuleList.push("}\n");

                _tempRuleList.join(" ");

                _ruleListGenerated.push(_tempRuleList);
            }
        }

        return _ruleListGenerated;
    }

}

module.exports.RuleListManager = RuleListManager;
