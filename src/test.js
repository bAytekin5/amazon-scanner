const db = require('./db')
const arr = require('../clear.json')
// console.log(arr);

const ads = async ()=>{
    for (const item of arr) {
        await db.add(item)
    }
    db.find({}).then(res=>console.log(res.length))
}

ads()

