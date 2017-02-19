'use strict';

var DEFAULT_CONFIG = { 
    grid: {
        padding:{
            top:0,
            right:0,
            bottom:0,
            left:0
        }
    }
};

class chartit {

    constructor(config){
        var config=this.mergeDeep(DEFAULT_CONFIG, config);
        this.config=config;
    }

    isObject(item) {
        return (item && typeof item === 'object' && !Array.isArray(item) && item !== null);
    }

    mergeDeep(target, source) {
        let output = Object.assign({}, target);
        if (this.isObject(target) && this. isObject(source)) {
            Object.keys(source).forEach(key => {
            if (this.isObject(source[key])) {
                if (!(key in target))
                Object.assign(output, { [key]: source[key] });
                else
                output[key] = this.mergeDeep(target[key], source[key]);
            } else {
                Object.assign(output, { [key]: source[key] });
            }
            });
        }
        return output;
    }
}


module.exports=chartit;