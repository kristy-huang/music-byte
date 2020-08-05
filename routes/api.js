const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const spotify_api_calls = require('./spotify_api_calls');

//Set up .env file
require('dotenv').config();

let myGenres = [];

const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-read-collaborative',
    'playlist-read-private',
    'user-follow-read',
    'user-top-read',
    'user-read-recently-played'
]

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.CALLBACK_URL
});

router.get('/login', async (req, res) => {
    myGenres = [];
    try {
        const authorizeURL = await spotifyApi.createAuthorizeURL(scopes);
        // console.log(authorizeURL);
        res.json({ url: authorizeURL + '&show_dialog=true', success: true });
    } catch (err) {
        console.log(`login: ${err}`);
        res.status(400).send(err);
    }
});

//Spotify redirects to /api/callback after successful login
router.get('/callback', async (req, res) => {
    //Get auth code from query params
    let code = req.query.code;
    // console.log('Code:' + code);
    try {
        //Get access token
        let data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body.access_token;
        const refresh_token = data.body.refresh_token;
        // spotifyApi.setAccessToken(access_token);
        // spotifyApi.setRefreshToken(refresh_token);
        req.session.access_token = access_token;
        req.session.refresh_token = refresh_token;
        console.log('Success: Authentication success, access and refresh tokens obtained');
        res.redirect('/loading');
    } catch (err) {
        console.log(`callback: Authentication error: ${err}`);
        res.redirect('/welcome');
    }
});

router.get('/verify', (req, res) => {
    if (req.session.access_token === undefined || req.session.access_token === null) {
        res.json({ success: false })
    } else {
        res.json({ success: true });
    }
});

// const getNewAccessToken = async function() {
//     try {
//         let data = await spotifyApi.refreshAccessToken();
//         const access_token = data.body.access_token;
//         console.log("The access token has been refreshed!");
//         // Save the access token so that it's used in future calls
//         spotifyApi.setAccessToken(access_token);
//     } catch (err) {
//         console.log("Could not refresh access token", err);
//     }
// }

// router.get('/refreshToken', async (req, res) => {
//     try {
//         let data = await spotifyApi.refreshAccessToken();
//         const access_token = data.body.access_token;
//         console.log("The access token has been refreshed!");
//         // Save the access token so that it's used in future calls
//         spotifyApi.setAccessToken(access_token);
//     } catch (err) {
//         console.log("Could not refresh access token", err);
//     }
// });

router.get('/logout', (req, res) => {
    // spotifyApi.setAccessToken(null);
    // spotifyApi.setRefreshToken(null);


    // delete the session
    req.session.destroy((err) => {
        if (err) {
            res.status(400).json({ success: false });
        } else {
            res.status(200).json({ success: true });
        }
    });
});

/*router.get('/playlistImg', (req, res) => {
    spotify_api_calls.getPlaylistImg(playlists).then(result => {
        // console.log(result.data[0].url)
        res.json(result.data[0].url);
    }).catch(err => console.log(err));
});*/

router.get('/myProfile', (req, res) => {
    if (req.session.access_token) {
        spotify_api_calls.getUserProfile(req.session.access_token)
            .then(result => {
                let profile = { 'name': result.data.display_name, 'images': null };
                if (result.data.images[0] != undefined) {
                    if (result.data.images[0].url != null && result.data.images[0].url != undefined) {
                        profile.images = result.data.images[0].url;
                    }
                }
                console.log(`Success: Retrieved profile info`);
                res.status(200).send(profile);
            }).catch(err => {
                console.log(`myProfile: ${err}`);
                res.status(400).send(err);
            });
    } else {
        res.status(401).send({});
    }
});

/**
 * Tracks do not have an assigned genre. To extract a genre from a track, 
 * you have to get the track's artists and extract its genre from its artists
 */

router.get('/myTopTracks', async (req, res) => {
    if (req.session.access_token) {
        let myTopTracks = []; //contains an arr of the artists' href of each track
        let counter = 0;

        spotify_api_calls.getTop(req.session.access_token, 'tracks')
            .then(result => {
                for (let i = 0; i < result.data.items.length; i++) {
                    for (let j = 0; j < result.data.items[i].album.artists.length; j++) {
                        myTopTracks[counter++] = result.data.items[i].album.artists[j].href;
                    }
                }
                spotify_api_calls.getGenreFromTracks(req.session.access_token, myTopTracks)
                    .then(result => {
                        for (let i = 0; i < result.length; i++) {
                            for (let j = 0; j < result[i].data.genres.length; j++) {
                                myGenres.push(result[i].data.genres[j]);
                            }
                        }
                    });
                console.log(`Success: Retrieved top tracks`);
                res.status(200).send(myTopTracks);
            }).catch(err => {
                console.log(`myTopTracks: ${err}`);
                if (err.message === "Unauthorized") {
                    res.status(401).send(err);
                } else {
                    res.status(400).send(err);
                }
            });
    } else {
        res.status(401).send({});
    }
});

router.get('/myArtists', (req, res) => {
    if (req.session.access_token) {
        spotify_api_calls.getArtists(res,
            spotify_api_calls.getTop(req.session.access_token, 'artists'),
            spotify_api_calls.getFollowedArtists(req.session.access_token),
            myGenres)
            .catch(err => {
                console.log(`myArtists: ${err}`);
                res.status(400).send(err);
            });
    } else {
        res.status(401).send({});
    }
});

router.get('/myGenres', (req, res) => {
    if (req.session.access_token) {
        //Set is used instead of array because we don't want repetition
        let myGenreSet = new Set(myGenres);
        myGenres = Array.from(myGenreSet);
        console.log('Success: Retrieved genres');
        console.log(myGenreSet);
        res.status(200).send(myGenres);
    } else {
        res.status(401).send({});
    }
});

router.get('/recommendPlaylists', (req, res) => {
    if (req.session.access_token) {
        spotify_api_calls.searchAll(
            req.session.access_token,
            myGenres,
            'playlist')
            .then(result => {
                let playlistData = [];
                let counter = 0;

                for (let i = 0; i < result.length; i++) {
                    if (result[i].data.playlists.offset < result[i].data.playlists.total) {
                        for (let j = 0; j < result[i].data.playlists.items.length; j++) {
                            playlistData[counter] = {
                                name: result[i].data.playlists.items[j].name,
                                id: result[i].data.playlists.items[j].id,
                                owner: result[i].data.playlists.items[j].owner.display_name,
                                description: result[i].data.playlists.items[j].description,
                                external_urls: result[i].data.playlists.items[j].external_urls.spotify,
                                tracks: result[i].data.playlists.items[j].tracks,
                                images: ''
                            };
                            if (result[i].data.playlists.items[j].images[0] != undefined) {
                                playlistData[counter++].images = result[i].data.playlists.items[j].images[0].url
                            }
                        }
                    }
                    // console.log(result[i].data);
                }

                if (playlistData.length === 0) {
                    console.log('Success: Retrieved 0 recommended playlists');
                    res.status(400).json({ 'err': '', 'noData': true });
                } else {
                    playlistData = spotify_api_calls.shuffleArr(playlistData);
                    console.log('Success: Retrieved recommended playlists');
                    res.status(200).send(playlistData);
                }
            })
            .catch(err => {
                console.log(`recommendPlaylists: ${err}`);
                res.status(400).json({ 'err': err, 'noData': false });
            });
    } else {
        res.status(401).send({});
    }
});

router.get('/randomPlaylists', async (req, res) => {
    if (req.session.access_token) {
        const randomOffset = Math.floor(Math.random() * 1900);
        let playlistData = [];

        spotify_api_calls.search(req.session.access_token, spotify_api_calls.getRandomQuery(), 'playlist', 50, randomOffset)
        .then(result => {
            for (let i = 0; i < result.data.playlists.items.length; i++) {
                playlistData[i] = {
                    name: result.data.playlists.items[i].name,
                    id: result.data.playlists.items[i].id,
                    owner: result.data.playlists.items[i].owner.display_name,
                    description: result.data.playlists.items[i].description,
                    external_urls: result.data.playlists.items[i].external_urls.spotify,
                    tracks: result.data.playlists.items[i].tracks,
                    images: ''
                };
                if (result.data.playlists.items[i].images[0] != undefined) {
                    playlistData[i].images = result.data.playlists.items[i].images[0].url;
                }
            }
            console.log(`Success: Retrieved random playlists`);
            res.status(200).send(playlistData);
        }).catch(err => {
            console.log(`randomPlaylists: ${err}`);
            if (err.message === "Unauthorized") {
                res.status(401).send(err);
            } else {
                res.status(400).send(err);
            }
        })
    } else {
        res.status(401).send({});
    }
});

router.get('/search', async (req, res) => {
    if (req.session.access_token) {
        let playlistData = [];
        spotify_api_calls.search(req.session.access_token, req.query.searchStr, 'playlist', 20, 0)
        .then(result => {
            for (let i = 0; i < result.data.playlists.items.length; i++) {
                playlistData[i] = {
                    name: result.data.playlists.items[i].name,
                    id: result.data.playlists.items[i].id,
                    owner: result.data.playlists.items[i].owner.display_name,
                    description: result.data.playlists.items[i].description,
                    external_urls: result.data.playlists.items[i].external_urls.spotify,
                    tracks: result.data.playlists.items[i].tracks,
                    images: ''
                };
                if (result.data.playlists.items[i].images[0] != undefined) {
                    playlistData[i].images = result.data.playlists.items[i].images[0].url;
                }
            }
            console.log(`Success: Retrieved searched playlists`);
            res.status(200).send(playlistData);
        }).catch(err => {
            console.log(`search: ${err}`);
            res.status(400).send(err);
        });
    } else {
        res.status(401).send({});
    }
});

router.get('/selectedPlaylist', async (req, res) => {
    if (req.session.access_token) {
        spotify_api_calls.getPlaylist(req.session.access_token, req.query.playlistId)
            .then(result => {
                let playlistData = {
                    name: result.data.name,
                    id: result.data.id,
                    owner: result.data.owner.display_name,
                    description: result.data.description,
                    external_urls: result.data.external_urls.spotify,
                    tracks: '',
                    images: ''
                }
                if (result.data.images[0] != undefined) {
                    playlistData.images = result.data.images[0].url;
                }
                console.log('Success: Retrieved selected playlist');
                res.status(200).send(playlistData);
            }).catch(err => {
                console.log(`selectedPlaylist: ${err}`);
                res.status(400).send(err);
            });
    } else {
        res.status(401).send({});
    }
});

router.get('/tracks', async (req, res) => {
    if (req.session.access_token) {
        let trackData = [];
        // console.log(req.query.playlistId);
        spotify_api_calls.getTracks(req.session.access_token, req.query.playlistId).then(result => {
            for (let i = 0; i < result.data.items.length; i++) {
                trackData[i] = {
                    name: result.data.items[i].track.name,
                    id: result.data.items[i].track.id,
                    artists: [],
                    duration_ms: result.data.items[i].track.duration_ms,
                    external_urls: result.data.items[i].track.external_urls.spotify,
                    preview_url: result.data.items[i].track.preview_url,
                };
                for (let j = 0; j < result.data.items[i].track.artists.length; j++) {
                    trackData[i].artists[j] = result.data.items[i].track.artists[j].name;
                }
            }
            console.log(`Success: Retrieved tracks`)
            res.status(200).send(trackData);
        }).catch(err => {
            console.log(`tracks: ${err}`);
            res.status(400).send(err);
        });
    } else {
        res.status(401).send({});
    }
})
module.exports = router;
