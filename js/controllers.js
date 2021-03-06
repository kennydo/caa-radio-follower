'use strict';

// the max this limit can be is the number of results that the JSON generator gives us
var maxNumSongsToDisplay = 20;

function LatestSongsListCtrl($scope, $interval, LatestSongs){
    var maxTimestamp;
    $scope.songs = [];

    // inital populating of list of songs
    LatestSongs.get({}, function(latestSongs){
        $scope.songs = latestSongs.songs.slice(0, maxNumSongsToDisplay);

        // the most recent played song is first
        if(latestSongs.songs.length > 0){
            maxTimestamp = latestSongs.songs[0].timestamp;
        }
    });

    var periodicallyFetchSongs = $interval(function(){
        LatestSongs.get({}, function(latestSongs){
            var song;
            var newSongs = [];

            for(var i=0, l=latestSongs.songs.length; i < l; i++){
                song = latestSongs.songs[i];
                if(song.timestamp > maxTimestamp){
                    newSongs.push(song); // append song to newSongs
                } else {
                    break; // every song after this has already been seen
                }
            }

            if(newSongs.length > 0){
                $scope.songs = newSongs.concat($scope.songs).slice(0, maxNumSongsToDisplay);
                //console.log(new Date() + " - Added " + newSongs.length + " songs");

                maxTimestamp = newSongs[0].timestamp;
                //console.log("New maxTimestamp is now " + maxTimestamp);

                makeSongNotification(newSongs[0].artist, newSongs[0].title);
            }
        });
    }, 15 * 1000);
}

function makeSongNotification(artist, title){
    // mostly copied from https://developer.mozilla.org/en-US/docs/Web/API/notification
    var notification;

    var options = {};
    if(artist != null){
        options['body'] = artist;
    }
    options['icon'] = 'img/caa-radio-icon.png';

    if(!("Notification" in window)) {
        console.log("This browser does not support desktop notification");
    } else if (Notification.permission === "granted") {
        notification = new Notification(title, options);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission(function (permission) {
            if(!("permission" in Notification)) {
                Notification.permission = permission;
            }

            if (permission === "granted") {
                notification = new Notification(title, options);
            }
        });
    }
    return notification;
}
