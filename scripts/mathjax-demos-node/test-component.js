const {toMML} = require('./tex2mml-page-component')
// console.log(toMML)
const htmlfile = require('fs').readFileSync('a.html', 'utf8')
// console.log(htmlfile)
async function work(){
    try {
        let s= await toMML(htmlfile)
        console.log(s)
    }
    catch (e){
        console.log(e.toString())
    }
}
work()
