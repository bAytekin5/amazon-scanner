const xlsx = require('xlsx');
var db = require('./db')


const excell = async ()=>{
    let Headers = ['Name', 'Link', 'Asin'];
    var arrlist = []
    var all = await db.find({})
    all.forEach(el => {
        arrlist.push([el.name,el.link,el.asin])
    });
    let workbook = xlsx.utils.book_new();
    let worksheet = xlsx.utils.aoa_to_sheet([]);
    xlsx.utils.book_append_sheet(workbook, worksheet);
    xlsx.utils.sheet_add_aoa(worksheet, [Headers], { origin: 'A1' });
    xlsx.utils.sheet_add_aoa(worksheet, arrlist, { origin: 'A2' });
    xlsx.writeFile(workbook, "data.xlsx");
}


excell()