
module.exports = ({
    init : function(){
        //sFactory
        let factory = require("./sFactory")
        global.sFactory = new factory()
        //sSocket
        let socket = require("./sSocket")
        global.sSocket =  new socket()
        //dataMgr
        let datamgr = require("./datas/datamgr")
        global.GDataMgr = new datamgr()
        //通用协议
        global.Common = require('./protos/Common/Common_pb');
        //Https
        global.Http = require('./protos/Http/Http_pb');
        
        //Login路由
        global.Login = require('./protos/Login/Login_pb');
        let login = require('./datas/dLogin');
        global.dLogin = new login()
        GDataMgr.mDatas.Login = global.dLogin
        //账号验证
        global.Authen = require('./protos/Authen/Authen_pb');
        let Authen = require('./datas/dAuthen');
        global.dAuthen = new Authen()
        GDataMgr.mDatas.Authen = global.dAuthen

        global.GSMgr = require('./protos/GSMgr/GSMgr_pb');
        global.Match = require('./protos/Match/Match_pb');
        let dMatch = require('./datas/dMatch');
        global.dMatch = new dMatch()
        GDataMgr.mDatas.Match = global.dMatch

        global.Game = require('./protos/GameFramework/GameFramework_pb');
        let dGame = require('./datas/dGame');
        global.dGame = new dGame()
        GDataMgr.mDatas.Game = global.dGame

        //加载游戏协议，自己定义的
        global.Betsize = require('./protos/Betsize/Betsize_pb');
        let dBetsize = require('./datas/dBetsize');
        global.dBetsize = new dBetsize()
        GDataMgr.mDatas.Betsize = global.dBetsize
    }
});
