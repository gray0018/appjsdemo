const fs = require('fs');
// a = [["ava", "faefqa"], ["egveq", "eqgeqgv"]];
// b = JSON.stringify(a);

// fs.writeFile("D:/my.txt", b, "utf8", (err) => {
//     if (err) throw err;
//     console.log('The file has been saved!');
// })

// fs.readFile('D:/my.txt', "utf8", (err, data)=>{
//     if(err) throw err;
//     b = JSON.parse(data);
// })

var a = Buffer.alloc(1024);

fs.open('D:/my.txt', 'r', (err, fd) => {
    if (err) throw err;

    fs.read(fd, a, 0, 1024, null, (err, bytesRead, a) => {      
        if (err) throw err;
        console.log("read file finished!");
        console.log(`Read ${bytesRead} bytes!`);
        console.log(a.toString("utf8", 0, bytesRead));
    });
})

console.log(a);

// console.log("abcd");

// var fr = new FileReader();

// fr.readAsBinaryString("D:")
