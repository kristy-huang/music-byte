const express = require('express');
const router = express.Router();
const SpotifyWebApi = require('spotify-web-api-node');

require('dotenv').config();

const spotifyApi = new SpotifyWebApi({
    clientId: process.env.SPOTIFY_CLIENT_ID,
    clientSecret: process.env.SPOTIFY_CLIENT_SECRET,
    redirectUri: process.env.CALLBACK_URL
});

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

router.get('/login', (req, res) => {
    const authorizeURL = spotifyApi.createAuthorizeURL(scopes);
    //console.log(authorizeURL);
    res.json(authorizeURL + '&show_dialog=true');
});

router.get('/callback', async (req, res) => {
    //Get auth code from query params
    let code = req.query.code;
    // console.log('query:' + code);
    try {
        //Get access token
        let data = await spotifyApi.authorizationCodeGrant(code);
        const { access_token, refresh_token } = data.body;
        spotifyApi.setAccessToken(access_token);
        spotifyApi.setRefreshToken(refresh_token);
        res.json({success: true, msg: 'You are now logges in'});
    } catch (err) {
        console.log(err);
        res.json({success: false, msg: 'Something went wrong'});
    }
});

module.exports = router;