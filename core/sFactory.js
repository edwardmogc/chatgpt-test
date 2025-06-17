
var sFactory = class {
    constructor() {
        this.m_max = 2147483647
        this.m_cur = 0
    }

    allocID() {
        this.m_cur++ 
        if (this.m_cur>=this.m_max){
            this.m_cur = 0
        }
        return this.m_cur
    }

    initID() {
        this.m_cur = 0
    }
}

module.exports = sFactory
