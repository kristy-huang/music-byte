const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');
const spotify_api_calls = require('./spotify_api_calls');


//Set up .env file
require('dotenv').config();

let playlists = [];

let myGenres = [];
let counter = 0;

const scopes = [
    'user-read-private',
    'user-read-email',
    'playlist-modify-public', 'playlist-modify-private',
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
    try {
        const authorizeURL = await spotifyApi.createAuthorizeURL(scopes);
        // console.log(authorizeURL);
        res.json(authorizeURL + '&show_dialog=true');
    } catch (err) {
        console.log(`login: ${err}`);
        res.status(400).send(err);
    }
});

//Spotify redirects to /api/callback after login
router.get('/callback', async (req, res) => {
    //Get auth code from query params
    let code = req.query.code;
    // console.log('code:' + code);
    try {
        //Get access token
        let data = await spotifyApi.authorizationCodeGrant(code);
        const access_token = data.body.access_token;
        const refresh_token = data.body.refresh_token;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        console.log('Success: Authentication success, access and refresh tokens obtained');
        res.redirect('http://localhost:4200/home');
    } catch (err) {
        console.log(`callback: Authentication error: ${err}`);
        res.status(400).send(err);
    }
});

router.get('/featuredPlaylist', async (req, res) => {
    try {
        let result = await spotifyApi.getFeaturedPlaylists();
        // console.log(result.body);
        for (let i = 0; i < 5; i++) {
            playlists[i] = result.body.playlists.items[i];
        }
        console.log(`Success: Retrieved playlists`);
        res.status(200).send(result.body);
    } catch (err) {
        console.log(`featuredPlaylist: ${err}`);
        res.status(400).send(err);
    }
});

/*router.get('/playlistImg', (req, res) => {
    spotify_api_calls.getPlaylistImg(playlists).then(result => {
        // console.log(result.data[0].url)
        res.json(result.data[0].url);
    }).catch(err => console.log(err));
});*/

router.get('/myProfile', (req, res) => {
    spotify_api_calls.getUserProfile(spotifyApi.getAccessToken()).then(result => {
        console.log(`Success: Profile info`);
        res.status(200).send(result.data);
    }).catch(err => {
        console.log(`myProfile: ${err}`);
        res.status(400).send(err);
    });
});

router.get('/myArtists', (req, res) => {
    spotify_api_calls.getArtists(res,
        spotifyApi.getMyTopArtists(),
        spotifyApi.getFollowedArtists(),
        myGenres,
        counter)
        .catch(err => {
            console.log(`myArtists: ${err}`);
            res.status(400).send(err);
        });
});

router.get('/myGenres', (req, res) => {
    //Set is used instead of array because we don't want repetition
    let myGenreSet = new Set(myGenres);
    myGenres = Array.from(myGenreSet);
    console.log('Success: Retrieved genres');
    console.log(myGenreSet);
    res.status(200).send(myGenres);
});

router.get('/recommendPlaylists', (req, res) => {
    spotify_api_calls.searchAll(res,
        spotifyApi.getAccessToken(),
        myGenres,
        'playlist')
        .catch(err => {
            console.log(`recommendPlaylists: ${err}`);
            res.status(400).send(err);
        });
});

router.get('/randomPlaylists', async (req, res) => {
    const randomOffset = Math.floor(Math.random() * 1900);
    try {
        let result = await spotifyApi.search(spotify_api_calls.getRandomQuery(), ['playlist'], { limit: 50, offset: randomOffset });
        // console.log(result.body);
        console.log(`Success: Retrieved random playlists`);
        res.status(200).send(result.body.playlists.items);
    } catch (err) {
        console.log(`randomPlaylists: ${err}`);
        res.status(400).send(err);
    }
});

module.exports = router;
