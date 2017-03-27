const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')
const OSRM = require('osrm.js')

const osrm = new OSRM('https://router.project-osrm.org')

const readStream = fs.createReadStream(path.resolve(__dirname, './data/shenzhen_sample.csv'))


const rl = readline.createInterface({
    input: readStream
})


let coords = ''
rl.on('line', line => {
    let arr = line.split(',')
    if (arr[0] == 'XCoord') {
        return
    }

    coords += arr[0] + ',' + arr[1] + ';'
})


rl.on('close', () => {
    console.log(coords)

    osrm.table({
        coordinates: [[13.438640, 52.519930], [13.415852, 52.513191], [13.333086, 52.4224]],
        sources: [0],
        destinations: [1, 2],
    }, (err, result) => {
        console.log(result);
    });



})