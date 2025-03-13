const db = require('./db')

const clear = async () => {
    var all = await db.find({})
    for (const item of all) {
        await db.remove({ _id: item._id })
    }
    console.log('Tüm veriler silindi!');
}
clear()