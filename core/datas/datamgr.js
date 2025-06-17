
let datamgr = class {
    constructor(){
        this.mDatas = {};
    }
    //登录后刷新数据
    onLogin(){
        for (let key in this.mDatas) {
            if (this.mDatas[key].onLogin) {
                this.mDatas[key].onLogin()
            }
        }
    }
    onClear(_force){ //_force：强制清空
        for (let key in this.mDatas) {
            if (this.mDatas[key].onClear) {
                this.mDatas[key].onClear(_force)
            }
        }
    }
    //处理数据
    dispatch(_file, _method, _obj){
        if (this.mDatas[_file]) {
            if (this.mDatas[_file].dispatch && this.mDatas[_file].dispatch(_method, _obj)){
                if (GEvent && GEvent[_file+"_"+_method]){
                    GEvent.dispatch(_file+"_"+_method, _obj)
                }
            }
        } else {
            console.log("error none proto:", _file+"."+_method)
        }
        return false;
    }
}
module.exports = datamgr
