
let betsize = class {
    constructor(){
        //变量定义
	    this.table = null 
    }

    onClear(_force){
        
    }

    //处理数据
    dispatch(key, ack){
        if (ack.cret && ack.cret != 0) {
            console.log(GNotice && GNotice[ack.cret])
            return false
        }
        switch (key){
            case "ReconnectNoti": //重连数据
                this.betcfgMap = ack.betcfgMap
                this.plyinfo = ack.plyinfo
                this.tableinfo = ack.tableinfo
                console.log("betszie ReconnectNoti:", ack)
                //测试数据，客户端自己触发：
                this.Operate(1) //1为下注
                break;
            case "TableInfo":
                this.tableinfo = ack.tableinfo
                console.log("betszie TableInfo:", ack)
                break;
            //其他协议数
            default:
                console.log("login none:", key)
                return false
        }
        return true
    }
    async Operate(ttype){
       // 创建 PlayerOpGet 实例
        let msg = new global.Betsize.PlayerOpGet();

        // 设置基本字段
        msg.setOperate(ttype);              // 例如操作类型为 1

        // 创建一个 Groups 实例（代表一次下注记录）
        let group1 = new global.Betsize.Groups();
        group1.setType(1);              // 左下注
        group1.setBetnum(5000);

        // 假设还有一个 group2
        let group2 = new global.Betsize.Groups();
        group2.setType(2);              // 右下注
        group2.setBetnum(3000);

        // 给 BetCur map 设置值（必须使用 getBetcurMap()）
        let betCurMap = msg.getBetcurMap();
        betCurMap.set(1, group1); // 下注区域1
        betCurMap.set(2, group2); // 下注区域2
        
        // 构造 Any 包装器
        const Any = require('google-protobuf/google/protobuf/any_pb.js').Any;
        let anyMsg = new Any();

        // 设置 TypeUrl（这是关键，否则对端无法正确解析）
        anyMsg.setTypeUrl("type.googleapis.com/Betsize.PlayerOpGet");

        // 设置消息体（序列化成 binary）
        anyMsg.setValue(msg.serializeBinary());

        // 构造 GameMessage 并设置字段
        let mess = new global.Game.GameMessage();
        mess.setNopcode(1003);
        mess.setMsg(anyMsg); // 这里设置的是 Any 类型
        let ack = await global.sSocket.sendSyncData("Game.IMGame", mess.serializeBinary(), true)
        if (!ack || ack.ret != 0){
            return false
        }
        return ack
    }
};

module.exports = betsize