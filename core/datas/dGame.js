
var google_protobuf_any_pb = require('google-protobuf/google/protobuf/any_pb.js');

let game = class {
    constructor(){
        //变量定义
    }

    onClear(_force){
        
    }

    //处理数据
    dispatch(key, ack, _data){
        if (ack != "IMGame") {
            return false
        }
        let array = "Game.GameMessage".split(".")
        if (global[array[0]] && global[array[0]][array[1]]){
            let pbc = global[array[0]][array[1]].deserializeBinary(_data)
            ack = pbc.toObject()
            if (ack.msg){
                let url = ack.msg.typeUrl 
                let result = url.substring(url.lastIndexOf('/') + 1);
                array = result.split(".")
                if (array[0] == "GameFramework"){
                    array[0] = "Game"
                }
                if (global[array[0]] && global[array[0]][array[1]]){
                    let pbc = global[array[0]][array[1]].deserializeBinary(ack.msg.value)
                    let obj = pbc.toObject()
                    return GDataMgr.dispatch(array[0], array[1], obj)
                } else {
                    console.log("game none:", result);
                    return false
                }
            }
            //console.log("packet onRead : ", _key, obj);
        } else {
            console.log("game none:", key)
            return false
        }
        return true
    }
    //游戏登陆
    async Login(tableid, addr, cytype){
        cytype = cytype || 0
        let obj = {
            strTableID : tableid,
            Addr       : addr,
            CyType     : cytype, //货币类型
        }
        let data = global.sSocket.assignObject("Game.LoginReq", null, obj)
        let ack = await global.sSocket.sendSyncData("Game.LoginGet", data, true)
        if (!ack || ack.ret != 0){
            return false
        }
        return ack
    }
};

module.exports = game