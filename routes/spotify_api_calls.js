const axios = require('axios');

/*module.exports.getPlaylistImg = function (playlists) {
    let playlist_id = playlists[0].id;
    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/playlists/${playlist_id}/images`,
        headers: {
            'Authorization': `Bearer ${spotifyApi.getAccessToken()}`
        }
    })
    // .then(res => {
    //     console.log(res.data);
    //     return res.data.url;
    // })
}*/

const getUserProfile = function(access_token) {
    return axios({
        method: 'get',
        url: 'https://api.spotify.com/v1/me',
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
};

const getRandomQuery = function() {
    const characters = 'abcdefghijklmnopqrstuvwxyz';

    //Gets a random character from characters string ranging from index 0 to 26
    const randomCharacter = characters.charAt(Math.floor(Math.random() * characters.length));

    let randomQuery = '';
    // Places the wildcard character at the beginning or both beginning and end randomly.
    switch (Math.round(Math.random())) {
        case 0:
            randomQuery = randomCharacter + '%';
            break;
        case 1:
            randomQuery = '%' + randomCharacter + '%';
            break;
    }

    console.log(randomQuery);

    return randomQuery;
}

const search = function(access_token, query, type) {
    const randomOffset = Math.floor(Math.random() * 500);

    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/search?q=${query}&type=${type}&offset=${randomOffset}`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
};

const searchAll = async function(res, access_token, myGenres, type) {
    let query = '';
    let keywords = [];
    let promiseArr = [];

    for (let i = 0; i < myGenres.length; i++) {
        query = '';
        keywords = myGenres[i].split(' ');
        for (let i = 0; i < keywords.length; i++) {
            if (i === keywords.length - 1) {
                query += keywords[i];
            } else if (i === 0) {
                query += keywords[i] + '%20OR%20';
            } else {
                query += keywords[i] + '%20';
            }
        }
        promiseArr[i] = search(access_token, query, type);
    }

    Promise.all(promiseArr).then(result => {
        let playlistData = [];
        let max_length = 0;
        let counter = 0;

        if (result.length >= 50) {
            max_length = 50;
        } else {
            max_length = result.length;
        }

        for (let i = 0; i < max_length; i++) {
            if (result[i].data.playlists.offset < result[i].data.playlists.total) {
                playlistData[counter++] = result[i].data.playlists;
            }
            // console.log(result[i].data);
        }
        console.log('Success: Retreived recommended playlists');
        res.status(200).send(playlistData);
    })
}

const getArtists = async function(res, getMyTopArtists, getFollowedArtists, myGenres, counter) {
    let myArtists = [];
    let artistIndex = 0;
    let [topArtists, followedArtists] = await Promise.all([
        getMyTopArtists,
        getFollowedArtists
    ]);
    for (let i = 0; i < topArtists.body.items.length; i++) {
        myArtists[artistIndex++] = {
            name: topArtists.body.items[i].name,
            id: topArtists.body.items[i].id
        }
        for (let j = 0; j < topArtists.body.items[i].genres.length; j++) {
            myGenres[counter++] = topArtists.body.items[i].genres[j];
        }
    };
    for (let i = 0; i < followedArtists.body.artists.items.length; i++) {
        myArtists[artistIndex++] = {
            name: followedArtists.body.artists.items[i].name,
            id: followedArtists.body.artists.items[i].id
        }
        for (let j = 0; j < followedArtists.body.artists.items[i].genres.length; j++) {
            myGenres[counter++] = followedArtists.body.artists.items[i].genres[j];
        }
    };

    console.log(`Success: Retrieved top artists and genres. Number of Artists: ${myArtists.length}`);
    res.status(200).send(myArtists);
};

module.exports = {
    getUserProfile: getUserProfile,
    getRandomQuery: getRandomQuery,
    searchAll: searchAll,
    getArtists: getArtists
};