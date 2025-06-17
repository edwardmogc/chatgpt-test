const os = require('os');

var Authen = class {
    constructor(){
        this.PID = 0 
        this.Ticket = ''
        this.Source = 1100336 //注册渠道
    }
    //处理数据
    dispatch(key, ack){
        if (ack.cret && ack.nret != 0) {
            console.log(GNotice && GNotice[ack.cret])
            return false
        }
        switch (key){
            case "VerifyAccountAck": //错误通知
                this.PID = ack.npid 
                this.Ticket = ack.strticket
                break;
            default:
                console.log("login none:", key)
                return false
        }
        return true
    }
    check(callback){
        global.dLogin.Connect(async function(obj){
            if (obj){
                let ack = await global.dAuthen.AuthenGet()
                if (ack && ack.nret==0){
                    if (callback){
                        callback(ack)
                    }
                } else {
                    console.error("登陆错误:", ack.cret)
                    if (callback){
                        callback(false)
                    }
                }
            } else {
                console.log("登录失败")
                if (callback){
                    callback(false)
                }
            }
        })
    }
    //获取ip
    async GetIP(){ 
        if (this.ip){
            return this.ip 
        }
        let jsObj = {
            Source: this.Source,               // 渠道ID
            Version: "",                        // 设备ID
            Channel: "slotmaster",                   // 渠道
        };
        let httpack = await global.sSocket.sendSync("Http.LoginGet", jsObj)
        if (!httpack || !httpack.info){
            return false
        }
        this.ip = httpack.info.ip
        return this.ip
    }
    async AuthenGet(){
        let ip = await this.GetIP()
        let jsObj = {
            nSource: 1100336,                    // 渠道ID
            strDeviceId: this.getLocalAddr(),    // 设备ID
            strIP: ip,                  // 登录IP地址
        };
        //第三个参数为不检查请求与返回协议是否一致
        //如果检查，会检查请求方法与返回方法是否一致
        //比如请求LoginGet和收到LoginXXX是一致的，
        //如果请求LoginGet收到LoginResponse则不一致
        let result = await global.sSocket.sendSync("Authen.VerifyAnonymousReq", jsObj, true)
        return result
    }
    getLocalAddr() { //获取mac地址，自己实现
        const interfaces = os.networkInterfaces();
        let errIp = "127.0.0.1";
        for (const name of Object.keys(interfaces)) {
            if (name.includes("以太网")){
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        return iface.mac;
                    }
                }
            }
        }
        for (const name of Object.keys(interfaces)) {
            if (name.includes("WLAN")){
                for (const iface of interfaces[name]) {
                    if (iface.family === 'IPv4' && !iface.internal) {
                        return iface.mac;
                    }
                }
            }
        }
        return errIp;
    }
}
module.exports = Authen