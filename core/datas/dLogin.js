
let login = class {
    constructor(){
        //变量定义
	    this.curtime = null 
        this.m_curNum = 0
        this.m_disNum = 0
        this.m_maxNum = 30
        this.logined = false //登录成功过
        this.success = false //登录流程是否成功

        let self = this 
        setInterval(() => {
            if (self.success){
                let jsObj = {
                    PID: 1,
                };
                global.sSocket.sendSync("Login.EchoNot", jsObj)
            }
        }, 30000);
    }

    onClear(_force){
        
    }

    //处理数据
    dispatch(key, ack){
        if (ack.cret && ack.cret != 0) {
            console.log(GNotice && GNotice[ack.cret])
            return false
        }
        if (key == "EchoNot") {
            return
        }
        switch (key){
            default:
                console.log("login none:", key)
                return false
        }
        return true
    }
    Connect(_func){
        this.success = false
        global.sSocket.clearSocket()
        //192.168.0.163
        global.sSocket.connect("ws://gametest8800.1000.game", 8008, async function(ok){ 
            if (ok){
                if (_func){
                    _func(true)
                }
            } else {
                if (_func){
                    _func(false)
                }
            }
		})
    }
    async Login(){
        let ip = await dAuthen.GetIP()
        let jsObj = {
            PID      : dAuthen.PID,        // 用户id
            Ticket   : dAuthen.Ticket,     // 用户Ticket
            AppID    : 1100,               // 登陆的appid，与服务器配置对应
            StrMac   : dAuthen.getLocalAddr(),        // mac地址
            StrIP    : ip,        // 上报ip
            Channel  : dAuthen.Source,        // 渠道号
        };
        let ack = await global.sSocket.sendSync("Login.LoginGet", jsObj)
        if (!ack || ack.cret != 0){
            return false
        }
        this.curtime = ack.time //服务器时间戳
        this.success = true //登陆成功

        //设置断开回调
        let self = this
        global.sSocket.setCloseBack(function(){
            self.success = false //登陆成功
        })
        return ack
    }
    sendEcho(){
        global.sSocket.sendPacket("Login.EchoNot", {PID: dAuthen.pid})
    }
};

module.exports = login