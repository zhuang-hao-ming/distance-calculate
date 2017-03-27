const readline = require('readline')
const fs = require('fs')
const os = require('os')
const path = require('path')
const OSRM = require('osrm.js')
const co = require('co')
const osrm = new OSRM('http://127.0.0.1:5000')

const readStream = fs.createReadStream(path.resolve(__dirname, './data/shenzhen_sample.csv'))
const writeStream = fs.createWriteStream(path.resolve(__dirname, './data/result.csv'))

const rl = readline.createInterface({
    input: readStream
})
const step = 4

let coordinates = []
rl.on('line', line => {
    let arr = line.split(',')
    if (arr[0] == 'XCoord') {
        return
    }

    coordinates.push([
		arr[0],arr[1]
	])
})

function getTablePromise(coordinates, sources) {
	return new Promise((resolve, reject) => {
		osrm.table({
			coordinates: coordinates,
			sources: sources,
			
		}, (err, result) => {
			if (err) {				
				return reject(err)
			}
			if (result.code !== 'Ok') {
				return reject(result.code)
			}

			resolve(result)
								
		});
	})
}


function* getDistance (coordinates, i, step) {

	let sources = []
	for (let j = 0; j < step; j++) {
		sources.push(j + i)
	}
	let result = yield getTablePromise(coordinates, sources);
	let durations = result.durations
	for (let j = 0; j < durations.length; j++) {
		let duration = result.durations[0]
		writeStream.write(duration.join(',') + os.EOL)
		console.log('the' + (i + j) + 'th query')
	}
	// let queries = []
	// for (let j = i; j < i + step; j++) {
	// 	queries.push(getTablePromise(coordinates, j))
	// }
	// let results = yield queries
	// for (let j = 0; j < results.length; j++) {
	// 	let result = results[j]
	// 	let duration = result.durations[0]
	// 	writeStream.write(duration.join(',') + os.EOL)
	// 	console.log('the' + (i + j) + 'th query')
	// }

}

rl.on('close', () => {    
		let begin = new Date()
	co(function* () {
		for (let i =0; i < coordinates.length; i += step) {
			yield* getDistance(coordinates, i, step)
		}
		console.log('elapse: ' + (new Date() - begin))
	})
		

})