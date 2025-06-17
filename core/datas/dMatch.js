let match = class {
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
            case "StatusAck": //状态回复
                this.table = ack.table
                break;
            case "MatchAck": //匹配房间回复
                console.log("匹配房间成功:", ack)
                return ack
            default:
                console.log("match none:", key)
                return false
        }
        return true
    }
    
    // 获取桌子状态
    Status(){
        global.sSocket.sendPacket("Match.StatusGet", {})
    }
    
    // 匹配房间 - 获取房间信息
    async MatchGet(roomID) {
        
        // 构建请求对象
        let jsObj = {
            roomid: roomID,
            pass: "enter",
            rule: global.Match.MkRule(),
            table: global.Match.Table(),
        }
        
        console.log("发送房间匹配请求:", jsObj)
        
        // 发送同步请求
        let ack = await global.sSocket.sendSync("Match.MatchGet", jsObj)
        
        if (!ack) {
            console.error("MatchGet 请求失败")
            return false
        }
        
        if (ack.nret && ack.nret !== 0 && ack.nret !== -1001) {
            console.error("MatchGet 返回错误:", ack.nret)
            return false
        }
        
        console.log("MatchGet 成功:", ack)
        return ack
    }
    
    // 分配桌子 - 创建新桌子（如果需要的话）
    async AllocateTable(tableID, vecPlayers, strRule, strExtra, mapPlayerExtra) {
        let jsObj = {
            strtableid: tableID,
            vecplayers: vecPlayers || [],
            strrule: strRule || "",
            strextra: strExtra || "",
            mapplayerextra: mapPlayerExtra || {}
        }
        
        console.log("发送桌子分配请求:", jsObj)
        
        let ack = await global.sSocket.sendSync("Game.TableAllocateReq", jsObj)
        
        if (!ack || ack.ret !== 0) {
            console.error("AllocateTable 失败:", ack)
            return false
        }
        
        console.log("AllocateTable 成功:", ack)
        return ack
    }
};

module.exports = match