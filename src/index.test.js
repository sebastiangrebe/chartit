 var expect = require('chai').expect;
 var chartit = require('./index'); 
 var config={
                grid:{
                    padding:{
                        left:5
                    }
                }
            };
var chart=chartit.init(config);

 describe('chartit', function(){
    it ('should work!',function(){
        expect(true).to.be.true;
    });
    describe('init', function(){
        var chart=chartit.init(config);
        it ('should merge the config Objects',function(){
            expect(chart.config).to.contain.all.keys({'grid':{'padding':['top','right','bottom','left']}});
        });
    });
 });