const fs = require("fs")

//初始化global参数
global =
    (typeof globalThis !== 'undefined' && globalThis) ||
    (typeof window !== 'undefined' && window) ||
    (typeof global !== 'undefined' && global)

GEvent = null //事件通知
GNotice = null //通用通知定义

function main() {
    //加载框架
    const loadpt = require("./core/loadpt")
    loadpt.init() 

    //验证账号
    GetAccount(async function(ack){
        if (ack){
            //注册到LoginServer
            let ok = await dLogin.Login()
            //测试，获取桌子状态
            if (ok) {
                dMatch.Status()
            }
            //通过MatchGet获取房间信息，然后进入游戏
            if (ok){
                let roomID = "pinko_slot" // 或者根据货币类型选择 "mine2_slot"
                let cytype = 0 // 0对应美元，1对应bonus等
                
                // 先通过MatchGet获取房间信息
                let matchResult = await dMatch.MatchGet(roomID)
                if (matchResult && matchResult.table) {
                    let tableid = matchResult.table.tableid
                    let addr = matchResult.table.serveraddr
                    console.log("获取到房间信息:", tableid, addr)
                    
                    // 使用获取到的信息登录游戏
                    dGame.Login(tableid, addr, cytype)
                } else {
                    console.error("无法获取房间信息")
                }
            }
        }
    })
    //如果有账号直接注册到LoginServer
    let aaa = async function(){
        console.log("还活着")
        await new Promise(resolve => setTimeout(resolve, 1000)); // 休眠1000毫秒
        aaa()
    }
    aaa()
}
main();

//获取账号
function GetAccount(_call) {
    global.dAuthen.check(function(ack){
        if (ack){
            console.log("登陆成功")
            _call(ack)
        } else {
            console.log("登陆失败，自行决定是否弹窗!")  
            _call(false)     
        }
    })
}