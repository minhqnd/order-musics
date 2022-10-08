var songItem = `<div class="song-list-item">
                  <div class="thumbnail"></div>
                  <div class="song-info">
                    <div class="song-name">
                      <h3>%TITLE%</h3>
                      <p>%ARTIST%</p>
                    </div>
                    <div class="song-duration">
                      <button class="cursorup">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#upsvg"></use>
                        </svg>
                      </button>
                      <button class="cursordown">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#downsvg"></use>
                        </svg>
                      </button>
                      <button class="cursordel">
                        <svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
                          <use xlink:href="#deletesvg"></use>
                        </svg>
                      </button>
                      <span>2:52</span>
                    </div>
                  </div>
                </div>`

function renderItem(title,artist,id) {
  return `<div class="song-list-item">
                  <img src='https://i3.ytimg.com/vi/${id}/maxresdefault.jpg' class="thumbnail">
                  <div class="song-info">
                    <div class="song-name">
                      <h3>${title}</h3>
                      <p>${artist}</p>
                    </div>
                    <div class="song-duration">
                      <button class="cursorup">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#upsvg"></use>
                        </svg>
                      </button>
                      <button class="cursordown">
                        <svg width="32px" height="32px" viewBox="0 0 490 490" xmlns="http://www.w3.org/2000/svg">
                          <use xlink:href="#downsvg"></use>
                        </svg>
                      </button>
                      <button class="cursordel">
                        <svg width="32px" height="32px" xmlns="http://www.w3.org/2000/svg" viewBox="-3 -3 30 30">
                          <use xlink:href="#deletesvg"></use>
                        </svg>
                      </button>
                      <span>2:52</span>
                    </div>
                  </div>
                </div>`
}

const apiKeyList = ["AIzaSyAKkNJJh2kbSgl31RObQuuEaS_6oRzT30Q", "AIzaSyAvPUsjjqCxjx9ZlIZh-EcdiBAFbJOeoO0", "AIzaSyB56E3cgBh0TMpNi5WQJT9AMFtChFIeEIo"];
var apiKey = apiKeyList[0];
var listVid = [];
var player;

// var bg = document.getElementsByClassName('bg')[0];
var musicPlayer = $('.player');
var prev = $('.prev-button');
var next = $('.next-button');
var repeat = $('.loop');
var form = document.getElementsByClassName('form')[0];
var newPlaylistId = document.getElementsByClassName('input')[0];
var ok = document.getElementsByClassName('ok')[0];
var body = document.getElementsByTagName('body')[0];

var tag = document.createElement('script');
var btn = $('.play-button');
var btn2 = document.getElementById('btn2');
var icon = document.getElementById('icon');
var icon2 = document.getElementById('icon2');
var para = document.getElementById('title');

var rand;
var repeatStatus = 0;

//Request Playlist Item
const getPlayListItems = async playlistID => {
  var token;
  var resultArr = [];
  const result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
    params: {
      part: 'id,snippet,contentDetails',
      maxResults: 50,
      playlistId: playlistID,
      key: apiKey
    }
  })
  //Get NextPage Token
  token = result.data.nextPageToken;
  resultArr.push(result.data);
  while (token) {
    let result = await axios.get(`https://www.googleapis.com/youtube/v3/playlistItems`, {
      params: {
        part: 'id,snippet,contentDetails',
        maxResults: 50,
        playlistId: playlistID,
        key: apiKey,
        pageToken: token
      }
    })
    token = result.data.nextPageToken;
    resultArr.push(result.data);
  }
  return resultArr;
};

//Get Title video and videoId
getPlayListItems("PL7ZciLEZ0K4j9_7OFeuAJIs9LBcoEj_he")
  .then(data => {
    data.forEach(item => {
      // item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId, airtist: i.snippet.channelTitle }));
      item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId, airtist: i.snippet.channelTitle }));
      
      item.items.forEach(i => $('.song-list').append(renderItem(i.snippet.title, i.snippet.channelTitle, i.snippet.resourceId.videoId)))
    });

    //create random index
    rand = Math.floor(Math.random() * listVid.length);
    checkPrivate();
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  })
  .catch(err => {
    changeAPIKey(apiKeyList[1], err);
  });


function changeAPIKey(newKey, err) {
  if (err.response.data.error.errors[0].reason == "dailyLimitExceeded") {
    apiKey = newKey;
    getPlayListItems("PL7ZciLEZ0K4j9_7OFeuAJIs9LBcoEj_he")
      .then(data => {
        data.forEach(item => {
          item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId }));

          rand = Math.floor(Math.random() * listVid.length);
          checkPrivate();
          tag.src = "https://www.youtube.com/iframe_api";
          var firstScriptTag = document.getElementsByTagName('script')[0];
          firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
        });
      })
      .catch(err => {
        changeAPIKey(apiKeyList[2], err);
      });


  }
}


//setvolume 
$('.volume').on('input', function () {
  player.setVolume(this.value)
  var value = (this.value - this.min) / (this.max - this.min) * 100
  this.style.background = 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + value + '%, #fff ' + value + '%, white 100%)'
})

var onChangeTime = false

$('.current-playing-time').on('input', function () {
  onChangeTime = true
  var value = (this.value - this.min) / (this.max - this.min) * 100
  this.style.background = 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + value + '%, #fff ' + value + '%, white 100%)'
})

$('.current-playing-time').change(function () {
  var valueChange = player.getDuration() * this.value / 10 / 100
  onChangeTime = false
  player.seekTo(valueChange)
});




function onYouTubeIframeAPIReady() {
  player = new YT.Player('player', {
    height: '0',
    width: '0',
    videoId: listVid[rand].idVid,
    events: {
      'onReady': onPlayerReady,
      'onStateChange': onPlayerStateChange
    },
    playerVars: {
      'autohide': 0,
      'cc_load_policy': 0,
      'controls': 1,
      'disablekb': 1,
      'iv_load_policy': 3,
      'modestbranding': 1,
      'rel': 0,
      'showinfo': 0,
      'autoplay': 1,
      'm': 0

    }
  });

  $('#song-title').text(listVid[rand].title);
  $('#song-artist').text(listVid[rand].airtist)
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${listVid[rand].idVid}/maxresdefault.jpg`);
  // console.log(listVid[rand].idVid)

  setInterval(function () {
    if (player.getPlayerState() == 0) {
      nextVideo();
      playButton(true);
    }
    if (!onChangeTime) {
      var currentTime = (player.getCurrentTime() / player.getDuration()) * 100
      $('.current-playing-time').val(currentTime * 10)
      $('.current-playing-time').css('background', 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + currentTime + '%, #fff ' + currentTime + '%, white 100%)');
    }
  }, 100);
}

function onPlayerReady(event) {
  player.setPlaybackQuality("small");
  btn.show()
  prev.show()
  next.show()
  btn2.show()
  repeat.show()
  form.style.display = "flex";
  $('#song-title').text(listVid[rand].title);
  playButton(player.getPlayerState() !== 5);
}

//On click button
// btn.onclick = changeStatusPlay;
// prev.onclick = prevSong;
// next.onclick = nextSong;
// repeat.onclick = repeatVideo;
// ok.onclick = changePlaylistId;

function playButton(play) {
  if (play) {
    $('.waves').removeClass('hide')
    $('#iconPlay').attr("xlink:href", "#pausebutton");
  } else {
    $('.waves').addClass('hide')
    $('#iconPlay').attr("xlink:href", "#playbutton");
  }
}

function changeStatusPlay() {

  if (player.getPlayerState() == 1 || player.getPlayerState() == 3) {
    pauseVideo();
    playButton(false);
  } else if (player.getPlayerState() != 0) {
    playVideo();
    playButton(true);

  }
}

function onPlayerStateChange(event) {
  if (event.data === 0) {
    playButton(false);
  }
}

function playVideo() {
  player.playVideo();
}

function pauseVideo() {
  player.pauseVideo();
}

function stopVideo() {
  player.stopVideo();
}

//previous song
function prevSong() {
  if (repeatStatus == 1) {
    repeat.style.opacity = "0.3";
    repeatStatus = 0;
  }
  playButton(false);
  stopVideo();
  if (rand - 1 < 0) {
    rand = listVid.length - 1;
  } else {
    rand -= 1;
  }
  checkPrivateBack();
  var id = listVid[rand].idVid;
  player.loadVideoById({ videoId: id });
  $('#song-title').text(listVid[rand].title);
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`);
  // bg.style.backgroundImage = `url('https://i3.ytimg.com/vi/${id}/maxresdefault.jpg')`;
  playButton(true);
}

//next song
function nextSong() {
  if (repeatStatus == 1) {
    repeat.style.opacity = "0.3";
    repeatStatus = 0;
  }
  playButton(false);
  stopVideo();
  if (rand + 1 == listVid.length) {
    rand = 0;
  } else {
    rand += 1;
  }
  checkPrivate();
  var id = listVid[rand].idVid;
  player.loadVideoById({ videoId: id });
  $('#song-title').text(listVid[rand].title);
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`);
  // musicPlayer.style.backgroundImage = `url('https://i3.ytimg.com/vi/${id}/maxresdefault.jpg')`;
  // bg.style.backgroundImage = `url('https://i3.ytimg.com/vi/${id}/maxresdefault.jpg')`;
  playButton(true);

}

// on Song end
function nextVideo() {
  if (repeatStatus == 1) {
    player.loadVideoById({ videoId: listVid[rand].idVid });
  } else {
    rand = Math.round(Math.random() * listVid.length);
    checkPrivate();
    var id = listVid[rand].idVid;
    player.loadVideoById({ videoId: id });
    $('#song-title').text(listVid[rand].title);
    $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`);
    // bg.style.backgroundImage = `url('https://i3.ytimg.com/vi/${id}/maxresdefault.jpg')`;
  }

}

//Repeat
function repeatVideo() {
  if (repeatStatus == 0) {
    repeat.style.opacity = "0.8";
    repeatStatus = 1;
  } else {
    repeat.style.opacity = "0.3";
    repeatStatus = 0;
  }
}

//Check private or deleted video
function checkPrivate() {
  if (listVid[rand].title == "Private video" || listVid[rand].title == "Deleted video") {
    if (rand == listVid.length - 1) {
      rand = 0;
    } else {
      rand += 1;
    }
    checkPrivate();
  }
};

function checkPrivateBack() {
  if (listVid[rand].title == "Private video" || listVid[rand].title == "Deleted video") {
    if (rand == 0) {
      rand = listVid.length - 1;
    } else {
      rand -= 1;
    }
    checkPrivateBack();
  }
};

//on New Playlist
function changePlaylistId() {
  var newId = newPlaylistId.value;
  if (newId == "") {
    return;
  }

  listVid = [];
  btn.style.display = "none";
  prev.style.display = "none";
  next.style.display = "none";
  btn2.style.display = "none";
  repeat.style.display = "none";
  $('#song-title').text("Loading...");

  getPlayListItems(newId)
    .then(data => {
      data.forEach(item => {
        item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId }));
      });
      rand = Math.floor(Math.random() * listVid.length);
      checkPrivate();
      btn.show()
      prev.show()
      next.show()
      btn2.show()
      repeat.show()
      $('#song-title').text(listVid[rand].title);
      player.loadVideoById({ videoId: listVid[rand].idVid });
      playButton(true);
    });

}