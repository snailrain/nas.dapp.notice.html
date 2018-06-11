// JavaScript source code
"use strict";



var SubItem = function (text) {
    if (text) {
        var json = JSON.parse(text);
        this.account = json.account;
        this.type = json.type;
        this.validDate = json.validDate;
    }
    else {
        this.account = "";
        //0为邮箱
        this.type = 0;
        this.validDate = new Date();
    }
}

SubItem.prototype = {
    toString: function () {
        return JSON.stringify(this);
    }
};


var SubContract = function () {
    LocalContractStorage.defineProperty(this, "SubList", null);
    LocalContractStorage.defineMapProperty(this, "Sub", {
        parse: function (text) {
            return new SubItem(text);
        },
        stringify: function (o) {
            return o.toString();
        }
    });
    LocalContractStorage.defineProperty(this, "notic_title", null);
    LocalContractStorage.defineProperty(this, "notic_content", null);
};

SubContract.prototype = {
    init: function () {
    },
    //新增订阅者
    addSub: function (account, type) {
        if (!account || account == "") {
            throw new Error("account不合法");
        }
        if (isNaN(type)) {
            throw new Error("type不合法");
        }
        if (account.length > 50) {
            throw new Error("account过长");
        }

        var subItem = new SubItem();
        subItem.account = account;
        subItem.type = type;
        subItem.validDate = addDate(new Date(), 30);
        if (this.SubList) {
            var temp = new Array();
            for (var i = 0; i < this.SubList.length; i++) {
                temp.push(this.SubList[i]);
                if (this.SubList[i].account == account && this.SubList[i].type == type) {
                    throw new Error("已存在相同的订阅");
                }
            }
            temp.push(subItem);
            this.SubList = temp;
        }
        else {
            var list = new Array();
            list.push(subItem);
            this.SubList = list;
        }

        this.Sub.set(account, subItem);
    },
    addBatchSub: function (array) {
        var count = 0;
        for (var i = 0; i < 3; i++) {
            if (array[i*2]) {
                count++;
                this.addSub(array[i * 2], array[(i * 2) + 1]);
            }
        }
        if (count == 0) {
            throw new Error("没有任何订阅产生");
        }
    },
    getAllSub: function () {
        return this.SubList;
    },
    getSubDetail: function (account) {
        return this.Sub.get(account);
    },
    updateLastNotic: function (title,content) {
        this.notic_title = title;
        this.notic_content = content;
    },
    getLastNotic: function () {
        return { "title": this.notic_title, "content": this.notic_content};
    }

};

//时间加一天
function addDate(date, days) {
    if (days == undefined || days == '') {
        days = 1;
    }
    var date = new Date(date);
    date.setDate(date.getDate() + days);
    var month = date.getMonth() + 1;
    var day = date.getDate();
    return date.getFullYear() + '-' + getFormatDate(month) + '-' + getFormatDate(day);
}
function getFormatDate(arg) {
    if (arg == undefined || arg == '') {
        return '';
    }

    var re = arg + '';
    if (re.length < 2) {
        re = '0' + re;
    }

    return re;
}

module.exports = SubContract;