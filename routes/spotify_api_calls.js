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

    let randomQuery = randomCharacter;

    console.log(randomQuery);
    return randomQuery;
}

/**
 * Uses the Fisher-Yates shuffle algorithm to shuffle array in O(n) time
 */

const shuffleArr = function(arr) {
    let length = arr.length;
    for (let i = length - 1; i > 0; i--) {
        pick = Math.floor(Math.random() * (i + 1));
        temp = arr[i];
        arr[i] = arr[pick];
        arr[pick] = temp;
    }
    return arr;
}

const getTop = function(access_token, type) {
    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/me/top/${type}`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
}

const getPlaylist = function(access_token, playlist_id) {
    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/playlists/${playlist_id}`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
}

const getFollowedArtists = function(access_token) {
    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/me/following?type=artist`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
}

const search = function(access_token, query, type, limit, offset) {
    let randomOffset = '';
    if (offset === undefined) {
        randomOffset = Math.floor(Math.random() * 500);
    } else {
        randomOffset = offset;
    }

    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/search?q=${query}&type=${type}&limit=${limit}&offset=${randomOffset}`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
};

const searchAll = async function(access_token, myGenres, type) {
    let query = '';
    let keywords = [];
    let promiseArr = [];
    let max_length = 0;

    if (myGenres.length >= 25) {
        max_length = 25;
    } else {
        max_length = myGenres.length;
    }

    // myGenres = shuffleArr(myGenres);
    // console.log(myGenres);

    for (let i = 0; i < max_length; i++) {
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
        promiseArr[i] = search(access_token, query, type, 8);
    }
    return Promise.all(promiseArr);
}

const getArtists = async function(res, getMyTopArtists, getFollowedArtists, myGenres) {
    let myArtists = [];
    let artistIndex = 0;
    const max_length = 20;

    let [topArtists, followedArtists] = await Promise.all([
        getMyTopArtists,
        getFollowedArtists
    ]);

    for (let i = 0; i < topArtists.data.items.length; i++) {
        if (topArtists.data.items[i] != undefined) {
            myArtists[artistIndex++] = {
                name: topArtists.data.items[i].name,
                id: topArtists.data.items[i].id
            }
            for (let j = 0; j < topArtists.data.items[i].genres.length; j++) {
                myGenres.push(topArtists.data.items[i].genres[j]);
            }
        }
    };

    for (let i = 0; i < max_length; i++) {
        if (followedArtists.data.artists.items[i] != undefined) {
            myArtists[artistIndex++] = {
                name: followedArtists.data.artists.items[i].name,
                id: followedArtists.data.artists.items[i].id
            }
            for (let j = 0; j < followedArtists.data.artists.items[i].genres.length; j++) {
                myGenres.push(followedArtists.data.artists.items[i].genres[j]);
            }
        }
    };

    console.log(`Success: Retrieved top artists and genres. Number of Artists: ${myArtists.length}`);
    res.status(200).send(myArtists);
};

const getTracks = function(access_token, playlistId) {
    return axios({
        method: 'get',
        url: `https://api.spotify.com/v1/playlists/${playlistId}/tracks`,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
};

const getArtistsFromTracks = function(access_token, url) {
    return axios({
        method: 'get',
        url: url,
        headers: {
            'Authorization': `Bearer ${access_token}`
        }
    })
};

const getGenreFromTracks = function(access_token, urls) {
    let promiseArr = [];
    for (i = 0; i < urls.length; i++) {
        promiseArr[i] = getArtistsFromTracks(access_token, urls[i]);
    }
    return Promise.all(promiseArr);
};

module.exports = {
    getUserProfile: getUserProfile,
    getRandomQuery: getRandomQuery,
    shuffleArr: shuffleArr,
    getTop: getTop,
    getPlaylist: getPlaylist,
    getFollowedArtists: getFollowedArtists,
    search: search,
    searchAll: searchAll,
    getArtists: getArtists,
    getTracks: getTracks,
    getGenreFromTracks: getGenreFromTracks
};
