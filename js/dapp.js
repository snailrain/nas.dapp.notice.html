
"use strict";

var netPath = "https://mainnet.nebulas.io";
//var netPath = "https://testnet.nebulas.io";

//主
var contractAddress = "n1zUBYyFAWeVbjg8SzxEVQ5k5RFTeeCAmXJ";
//测试
//var contractAddress = "n1ib7LpqfqDBGuurLixHf1grMd769yPmfP4";

var nebulas = require("nebulas"),
    Account = nebulas.Account,
    neb = new nebulas.Neb();
neb.setRequest(new nebulas.HttpRequest(netPath));

var NebPay = require("nebpay");     //https://github.com/nebulasio/nebPay
var nebPay = new NebPay();

var currentTxHash = "";

var Dapp = function () {

}
Dapp.prototype = {
    coinNum: 0,
    account: "",
    integral: 0,
    init: function () {

        if (typeof (webExtensionWallet) === "undefined") {
            //showMsgDialog("需安装官方钱包插件：<a target='_blank' href='https://github.com/ChengOrangeJu/WebExtensionWallet'>WebExtensionWallet</a>安装后刷新页面");
        }
        $("#addSub").click(dapp.addSub);;
    },
    addSub: function () {
        var email = $("#email").val();
        if (email == "") {
            alert("请先填写邮箱");
            return;
        }
        var reg = /^([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+@([a-zA-Z0-9]+[_|\_|\.]?)*[a-zA-Z0-9]+\.[a-zA-Z]{2,3}$/;
        if (!reg.test(email)) { //正则验证不通过，格式不对
            alert("邮箱格式不正确");
            return;
        }

        update("addBatchSub", "[[\"" + $("#email").val() + "\",0]]", function (resp) {
            currentTxHash = resp.txhash;
            alert("已提交至区块链，请稍后……");
            $("#addSub").attr('disabled', true);
            $("#addSub").css("background-color","#BCBCBE");
        });
    }
   
};

function dialogErorrMsg(modal, msg) {
    $(modal).find(".divErrorMsg").text(msg);
}

function read(funName, args, callback) {
    var from = Account.NewAccount().getAddressString();
    //var from = "n1TA6on2ikjjUcpwbtjjcsAgHTP7fEZ41Bk";

    var value = "0";
    var nonce = "0"
    var gas_price = "1000000"
    var gas_limit = "2000000"
    var contract = {
        "function": funName,
        "args": args
    }

    neb.api.call(from, contractAddress, value, nonce, gas_price, gas_limit, contract).then(function (resp) {
        callback(JSON.parse(resp.result));
    }).catch(function (err) {
        showMsgDialog(err.message);
    });
}

var intervalQuery;
var serialNumber;
function update(funName, args, callbackTx) {
    var to = contractAddress;
    var value = "0";
    var callFunction = funName
    var callArgs = args

    serialNumber = nebPay.call(to, value, callFunction, callArgs, {    //使用nebpay的call接口去调用合约,
        listener: callbackTx        //设置listener, 处理交易返回信息
    });
    if (intervalQuery) {
        clearInterval(intervalQuery);
    }

    intervalQuery = setInterval(function () {
        funcIntervalQuery();
    }, 5000);
}

function funcIntervalQuery() {
    neb.api.getTransactionReceipt({ hash: currentTxHash }).then(function (receipt) {
        var result = receipt;
        if (result.status == 0) {
            alert("订阅失败，" + result.execute_result);
            clearInterval(intervalQuery);
            intervalQuery = undefined;
            currentTxHash = "";
            $("#addSub").attr('disabled', false);
            $("#addSub").css("background-color", "");
        }
        else if (result.status == 1) {
            alert("订阅成功");
            clearInterval(intervalQuery);
            intervalQuery = undefined;
            currentTxHash = "";
            $("#addSub").attr('disabled', false);
            $("#addSub").css("background-color", "");
        }
    });

}


var dapp = new Dapp();
dapp.init();
