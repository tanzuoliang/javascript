/**
 * Created by tanzuoliang on 17/2/22.
 */

class Rect{
    constructor(x,y,width,height){
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;

        this.centerX = this.x + this.width * 0.5;
        this.centerY = this.y + this.height * 0.5;

        this.right = x + width;
        this.up = y + height;
    }

    containsPoint(x,y){
        return x >= this.x && x <= this.right && y >= this.y && y <= this.up;
    }

    interactive(rect){
        let _x = rect.x > this.x?rect.x:this.x;
        let _y = rect.y > this.y?rect.y:this.y;

        return this.containsPoint(_x,_y) && rect.containsPoint(_x,_y);
    }
}


class Circle{
    constructor(x,y,radius){
        this.x = x;
        this.y = y;
        this.radius = radius;
    }

    interactive(rect){
        let _he = rect.height * 0.5 + this.radius;
        let wi = rect.width * 0.5 + this.radius;
        let dis_x = Math.abs(rect.centerX - this.x);
        let dis_y = Math.abs(rect.centerY - this.y);
        return dis_x < wi && dis_y < _he;
    }
}


let __link__class_id__ = 1;

class LinkArray{
    constructor(data){
        this.data = !data?[]:data;
        this.recycleIndexs = [];

        this.class_id = __link__class_id__++;
        this.itemkey = "INDEX" + this.class_id + "";
    }

    clear () {
        this.data.length = 0;
        this.recycleIndexs.length = 0;
    }

    add (item) {
        let index = this.recycleIndexs.length > 0?this.recycleIndexs.shift():this.data.length;
        this.data[index] = item;
        item[this.itemkey] = index;
    }

    get (key,tag) {
        for(let item of this.data){
            if(item && item[key] == tag){
                return item;
            }
        }

        return null;
    }

    addWithTag (item,tag) {
        let index = this.recycleIndexs.length > 0?this.recycleIndexs.shift():this.data.length;
        this.data[index] = item;
        item[this.itemkey] = index;
        item.__tag__ = tag;
    }

    getByTag  (tag) {
        for(let item of this.data){
            if(item.__tag__ == tag){
                return item;
            }
        }
        return null;
    }

    remove (item) {
        if(item.hasOwnProperty(this.itemkey)){
            let index = item[this.itemkey];
            if(index > -1){
                this.data[index] = null;
                this.recycleIndexs.push(index);
                item[this.itemkey] = -1;
            }
        }
    }
}


class Random{
    constructor(seed=5){
        this.seed = seed;
    }

    random(min, max){
        max = max || 1;
        min = min || 0;
        this.seed = (this.seed * 9301 + 49297) % 233280;
        var rnd = this.seed / 233280.0;
        var ret =  min + rnd * (max - min);
        return ret;
    }
}



class __MyData__{
    constructor(){
        this.offset = 1;
    }

    compress(data){
        let len = data.length;
        let flag = len % 2;
        len -= flag;
        let out = [];
        for(let i = 0; i < len; i+= 2){
            out[out.length] = String.fromCharCode(((data.charCodeAt(i) + this.offset) << 8) + data.charCodeAt(i + 1) + this.offset);
        }

        if(flag == 1){
            out[out.length] = String.fromCharCode(data.charCodeAt(len) + this.offset);
        }
        return out.join("");
    }

    unCompress(data){

        let len = data.length;
        let out = [];
        for(let i = 0; i < len;i++){
            let n = data.charCodeAt(i);
            if(n > 255){
                out[out.length] = String.fromCharCode((n>>8) - this.offset);
                out[out.length] = String.fromCharCode((n & 0XFF) - this.offset);
            }
            else{
                out[out.length] = String.fromCharCode(n - this.offset);
            }

        }

        return out.join("");
    }


}

const MY_DATA = new __MyData__();


const getFromMap = (map,key,callback)=>map.get(key) || map.set(key,callback()).get(key);

module.exports = {
    Rect,
    Circle,
    LinkArray,
    Random,
    getFromMap,
    MY_DATA
};

// module.exports.Rect = Rect;
// module.exports.Circle = Circle;
// module.exports.LinkArray = LinkArray;
//
// module.exports.Random = Random;