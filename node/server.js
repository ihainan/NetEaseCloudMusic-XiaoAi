const request = require('request')
const express = require('express')
const app = express()
const rp = require('request-promise');
const config = require('./config.json');

const apiService = config.api_url
const host = config.host
const port = config.port
const selfURL = 'http://' + host + ':' + port
const username = config.username
const password = config.password

rp({
	headers: {
		xhrFields: { withCredentials: true }
	},
	method: 'GET',
	resolveWithFullResponse: true,
	// TODO: get username and password from configuration file
	uri: apiService + '/login?email=' + username + '&password=' + password,
}).then(function (response) {
	// Extract user's cookie string and uid from the response
	console.log(response)
	const cookieString = response.headers['set-cookie']
	const userJSON = JSON.parse(response.body)
	const uid = userJSON.account.id
	console.log('cookieString = ' + cookieString + ', uid = ' + uid)

	// Get the ID of user's favorite song list
	rp({
		headers: {
			xhrFields: { withCredentials: true }
		},
		resolveWithFullResponse: true,
		method: 'GET',
		// TODO: get username and password from configuration file
		uri: apiService + '/user/playlist?uid=' + uid,
	}).then(function (response) {
		// Extrat the ID number of first play list
		const playListJSON = JSON.parse(response.body)
		const favoriteListID = playListJSON.playlist[0].id
		console.log('favoriteListID = ' + favoriteListID)

		/** APIs start here **/

		// Get song's real URL based on its ID
		app.get('/song', function (req, res) {
			// 1 second blank sound file
			const blankMP3 = 'http://iij.ihainan.me/tools/blank.mp3'

			// Get & redirect to the real URL
			const id = req.query.id
			console.log('song\'s ID = ' + id)
			rp({
				headers: {
					Cookie: cookieString,
					xhrFields: { withCredentials: true }
				},
				resolveWithFullResponse: true,
				method: 'GET',
				uri: apiService + '/song/url?id=' + id,
			}).then(function (response) {
				if (response.statusCode != 200) {
					console.log('Failed to get the URL of song ' + id + ', code = ' + response.statusCode)
					res.redirect(307, blankMP3)
				} else {
					const urlResponseJson = JSON.parse(response.body)
					const url = urlResponseJson.data[0].url
					if (url == null) {
						console.log('[WARN] Song with id ' + id + ' is not available')
						res.redirect(307, blankMP3)
					} else {
						console.log(id + ' -> ' + url)
						res.redirect(307, url)
					}
				}
			}).catch(function (error) {
				console.log('Failed to get the URL of song ' + id + ', error: ' + error)
				res.redirect(307, blankMP3)
			})
		})

		// Get user's favorite songs (30 at most)
		app.get('/likelist', function (req, res) {
			res.setHeader('Content-Type', 'application/json')
			rp({
				headers: {
					Cookie: cookieString,
					xhrFields: { withCredentials: true }
				},
				resolveWithFullResponse: true,
				method: 'GET',
				url: apiService + '/playlist/detail?id=' + favoriteListID,
			}).then(function (response) {
				if (response.statusCode == 200) {
					const tracks = JSON.parse(response.body).playlist.tracks
					const n = Math.min(20, tracks.length)
					var firstTwentySongs = tracks.slice(0, n)
					var result = {}
					var completedRequests = 0
					result.result = []
					firstTwentySongs.forEach(function (songInfo) {
						result.result.push(selfURL + '/song?id=' + songInfo.id)
						// return result to user
						completedRequests += 1
						if (completedRequests == firstTwentySongs.length) {
							res.status(200)
							res.send(JSON.stringify(result))
						}
					})
				} else {
					res.status(500)
					res.send(JSON.stringify({
						'error': 'Failed to get like list'
					}))
				}
			}).catch(function (error) {
				console.log('Error: ' + error)
				res.status(500)
				res.send(JSON.stringify({
					'error': error
				}))
			})
		})

		// Randomly choose user's favorite songs (30 at most)
		app.get('/random_likelist', function (req, res) {
			res.setHeader('Content-Type', 'application/json')
			rp({
				headers: {
					Cookie: cookieString,
					xhrFields: { withCredentials: true }
				},
				resolveWithFullResponse: true,
				method: 'GET',
				url: apiService + '/likelist?uid=' + uid,
			}).then(function (response) {
				if (response.statusCode == 200) {
					const json = JSON.parse(response.body)
					const ids = json.ids
					var result = {}
					var completedRequests = 0
					if (ids.length != 0) {
						const n = Math.min(20, ids.length)
						const firstTwentySongs = ids
							.map(x => ({ x, r: Math.random() }))
							.sort((a, b) => a.r - b.r)
							.map(a => a.x)
							.slice(0, n)
						result.result = []
						firstTwentySongs.forEach(function (id) {
							console.log(id)
							result.result.push(selfURL + '/song?id=' + id)

							// return result to user
							completedRequests += 1
							if (completedRequests == firstTwentySongs.length) {
								res.status(200)
								res.send(JSON.stringify(result))
							}
						})
					} else {
						res.status(200)
						res.send(JSON.stringify(result))
					}
				} else {
					res.status(500)
					res.send(JSON.stringify({
						'error': 'Failed to get like list'
					}))
				}
			}).catch(function (error) {
				console.log('Error: ' + error)
				res.status(500)
				res.send(JSON.stringify({
					'error': error
				}))
			})
		})

		// Get user's daily recommended songs (30 in total)
		app.get('/recommend', function (req, res) {
			res.setHeader('Content-Type', 'application/json')
			rp({
				headers: {
					Cookie: cookieString,
					xhrFields: { withCredentials: true }
				},
				resolveWithFullResponse: true,
				method: 'GET',
				url: apiService + '/recommend/songs',
			}).then(function (response) {
				if (response.statusCode == 200) {
					const recommend = JSON.parse(response.body).recommend
					const n = Math.min(30, recommend.length)
					var firstThirtySongs = recommend.slice(0, n)
					var result = {}
					var completedRequests = 0
					result.result = []
					firstThirtySongs.forEach(function (songInfo) {
						result.result.push(selfURL + '/song?id=' + songInfo.id)
						// return result to user
						completedRequests += 1
						if (completedRequests == firstThirtySongs.length) {
							res.status(200)
							res.send(JSON.stringify(result))
						}
					})
				} else {
					res.status(500)
					res.send(JSON.stringify({
						'error': 'Failed to get like list'
					}))
				}
			}).catch(function (error) {
				console.log('Error: ' + error)
				res.status(500)
				res.send(JSON.stringify({
					'error': error
				}))
			})
		})
		
		// Search artist


		/** APIs end here **/

		app.listen(port, '0.0.0.0', function () {
			console.log('Application is listening on port ' + port + '!')
		})
	}).catch(function (error) {
		console.log('Failed to start server, error: ' + error)
		process.exit(1)
	})
}).catch(function (error) {
	console.log('Failed to start server, error: ' + error)
	process.exit(1)
})