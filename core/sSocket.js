

const WebSocket = require('ws');

function handler(_target, _function){
    return _function.bind(_target)
};

const sSocket = class {
    /**
     * Constructor
     */
    constructor() {
        this._mbSocket=null,             //网络连接实例
        this._listener=null,             //协议监听界面
        this._sendData=[],               //发送的信息队列
        this._address=null,              //地址
        this._port=null,                 //端口号
        this._connected=false,           //当前连接状态
        this._onopened = false,           //连接成功

        this._lastTickTime=null,         //上次心跳时间
        this._startBack=null,
        this._closeBack=null,
        this._execArr = {}           // promise接收消息resolve处理器
        this.initData()
    }
    initData(){

    }
    setCloseBack(_handler) {
        this._closeBack = _handler;
    }
    isConnected(){
        return this._onopened;
    }
    //连接断开
    onDisConnect(){
        this.clearSocket()
    }
    //收到消息
    onRecv(_data){
        let _key = _data.type
        let array = _key.split(".")
        if (array.length<2){
            console.log("error:", _key, _data)
            return
        }
        if (global[array[0]] && global[array[0]][array[1]]){
            let pbc = global[array[0]][array[1]].deserializeBinary(_data.datas)
            let obj = pbc.toObject()
            GDataMgr.dispatch(array[0], array[1], obj)
            if (_data.extra != "") {
                let num = parseInt(_data.extra)
                let executor = this._execArr[num]
                if (executor) {
                    executor(obj, _key)
                    delete this._execArr[num]
                }
            } 
            //console.log("packet onRead : ", _key, obj);
        } else if (_key=="Game.IMGame"){
            dGame.dispatch(array[0], array[1], _data.datas)
        } else {
            console.log("error none obj:", _key, _data)
        }
    }
    //开始连接
    connect(_ip, _port, _startBack){
        let self = this;
        if (self._connected){
            if (_startBack){
                _startBack(true)
                return true
            }
        }
        if (!_ip && !_port) {
		    return false
        }
        
        
        self._mbSocket = new WebSocket(_ip+":"+_port)
        
        if (self._mbSocket.readyState>=2) {
            if (self._mbSocket) {
                self._mbSocket.close();
                self._mbSocket = null;
            }
            if (_startBack){
                _startBack(false)
                return false
            }
            return false
        }
        self._connected   = true;
        self._address = _ip;
        self._port    = _port
        self._startBack = _startBack;
        self._mbSocket.onopen = function(evt) {
            console.log("Connection open ...");
            self._mbSocket.binaryType = 'arraybuffer';
            self._onopened = true
            
            if (self._startBack){
                let callback = self._startBack
                self._startBack = null;
                callback(true);
            }
        };
        self._mbSocket.onmessage = function(evt) {
            let data = null
            let err = null
            try {
                data = self.onRead(evt.data)
            } catch (error) {
                err = error
            }
            if (data){
                self.onRecv(data)
            } else if (err){
                console.log("onmessage err:",err);
            }
        };
        self._mbSocket.onclose = function(evt) {
            console.error("Connection closed.");
            self.onDisConnect();
        }.bind(self._mbSocket);
        self._mbSocket.onerror = function(evt) {
            console.error("Connection onerror.", JSON.stringify(evt));
            //确保当前调用此方法的self._mbSocket与当前类的self._mbSocket是同一个
            if (self._mbSocket && self._mbSocket == this){
                self._mbSocket.onclose() 
            }
        }.bind(self._mbSocket);

        return true;
    }
    onWrite(_type, _data, _msgID) {
        let imlogin = new global.Login.IMLogin();
        imlogin.setType(_type) 
        imlogin.setDatas(_data)
        if (_msgID){
            imlogin.setExtra(_msgID.toString())
        }
        return imlogin.serializeBinary()
    }
    onRead(_buffer){
        let imlogin = global.Login.IMLogin.deserializeBinary(_buffer)
        let obj = imlogin.toObject()
        return obj;
    }

    assignObject(ttype, protoObj, jsObj, extra) {
        let array = ttype.split(".")
        if (array.length<=1){
            console.log('assignObject err', ttype);
            return null
        }
        if (!global[array[0]] || !global[array[0]][array[1]]){
            console.log('assignObject err', ttype);
            return null
        }
        let decode = false
        if (!protoObj){
            decode = true
            protoObj = new global[array[0]][array[1]]()
        }
		for (let key in jsObj) {
			if (jsObj.hasOwnProperty(key)) {
				let value = jsObj[key];
				if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
					// 如果值是对象，递归调用assignObject
					if (typeof protoObj[key] === "undefined"){
						console.log('assignObject', key);
						let setter = protoObj['set' + this.caseLetter(key)];
						if (setter) {
							if (global[array[0]][key]){
								let obj = new global[array[0]][key]()
								setter.call(protoObj, obj);
								this.assignObject(array[0]+"."+key, obj, value, extra);
							} else if (global[extra][key]){
								let obj = new global[extra][key]()
								setter.call(protoObj, obj);
								this.assignObject(extra+"."+key, obj, value, extra);
							}
						} else if (protoObj["get"+key+"Map"]){ //传输map类型
                            for (let k in value){
                                if (!jsObj.hasOwnProperty(k)) { //不是对象本身自带的方法
                                    protoObj["get"+key+"Map"]().set(k, value[k])
                                }
                            }
                        }
					}
				} else {// 如果值不是对象，尝试设置protoObj的对应属性
                    if (Array.isArray(value)){
                        let setter = protoObj['set' + this.caseLetter(key)+"List"];
                        if (setter) {
                            setter.call(protoObj, value);
                        }
                    } else {
                        let setter = protoObj['set' + this.caseLetter(key)];
                        if (setter) {
                            setter.call(protoObj, value);
                        }
                    }
				}
			}
		}
        if (decode){
            if (ttype != "Login.EchoNot"){
                console.log("socket sendPacket : ", protoObj.toObject());
            }
            return protoObj.serializeBinary()
        }
	}
	// 辅助函数，用于将字符串的首字母大写
	caseLetter(str) {
		str = str.toLowerCase();
		return str.charAt(0).toUpperCase() + str.slice(1);
	}
    sendPacket(ttype, jsObj, extra){
        let _data = this.assignObject(ttype, null, jsObj, extra)
        if (!_data){
            console.log('sendPacket err', ttype);
            return
        }   
        let data = this.onWrite(ttype, _data)
        if (!this._mbSocket || !this._onopened){
            console.log("sendPacket error opcode ", ttype);
            this._sendData[this._sendData.length] = data
            return
        }
        if (data){
            this._mbSocket.send(data)
            if (ttype != "Login.EchoNot"){
                console.log("socket sendPacket over :", ttype);
            }
        }
    }
    success(get, ack){
        var subStr1 = get.substring(0, get.length - 3); // 获取str1的前n-3位子串
        var subStr2 = ack.substring(0, ack.length - 3); // 获取str2的前n-3位子串
        if (subStr1 === subStr2) {
            return true
        } else {
            return false
        }
    }
    // 利用promise同步发送接收消息
    sendSync(ttype, jsObj, nocheck, extra){
        let _data = this.assignObject(ttype, null, jsObj, extra)
        if (!_data){
            console.log('sendPacket err', ttype);
            return
        } 
        return this.sendSyncData(ttype, _data, nocheck)
    }
    sendSyncData(ttype, _data, nocheck){
        if (!this._mbSocket){
            console.log("sendSync error opcode ", ttype);
            return
        }
        let self = this
        let executor = null
        let promise = new Promise((resolve, reject) => {
            executor = (value, err) => {
                if (err) {//reject(err)
                    if (!nocheck && !self.success(ttype, err)){
                        resolve(false) 
                        return
                    }
                }
                resolve(value)
            }
        })

        let msgID = global.sFactory.allocID()
        this._execArr[msgID] = executor
        let data = this.onWrite(ttype, _data, msgID)
        if (data){
            this._mbSocket.send(data)
            if (ttype != "Login.EchoNot"){
                console.log("socket sendSync over :", ttype);
            }
        }
        return promise
    }
    //重新连接
    reConnect(){
        return this.connect(this._address, this._port, this._startBack || this._closeBack)
    }
    // 关闭连接
    clearSocket(){
        let self = this
	    console.log("socket onDisConnect. ================ ");
        self._onopened    = false
        self._connected   = false;
        //清空当前_mbSocket回调

        self._sendData = []
        self._execArr   = {}
        
        if (self._mbSocket) {
            self._mbSocket.onopen = null
            self._mbSocket.onclose = null
            self._mbSocket.onerror = null
            self._mbSocket.onmessage = null
            self._mbSocket.close();
            self._mbSocket = null;
        }
        if (self._startBack){
            let callback = self._startBack
            self._startBack = null;
            callback(false);
        }
        else if (self._closeBack){
            let callback = self._closeBack
            self._closeBack = null;
            callback(false);
        }
    }
}
module.exports = sSocket