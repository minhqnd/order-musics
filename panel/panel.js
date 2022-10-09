function renderItem(title, artist, id, duration) {
  return `<div class="song-list-item">
                  <img src='https://i3.ytimg.com/vi/${id}/mqdefault.jpg' class="thumbnail">
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
                      <span>${duration}</span>
                    </div>
                  </div>
                </div>`
}

const apiKeyList = ["AIzaSyAvPUsjjqCxjx9ZlIZh-EcdiBAFbJOeoO0", "AIzaSyAKkNJJh2kbSgl31RObQuuEaS_6oRzT30Q", "AIzaSyB56E3cgBh0TMpNi5WQJT9AMFtChFIeEIo"];
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
var loopStatus = 0;

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


const getVideosItems = async ID => {
  var token;
  var resultArr = [];
  const result = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
    params: {
      part: 'id,contentDetails,snippet',
      id: ID,
      key: apiKey
    }
  })
  token = result.data.nextPageToken;
  resultArr.push(result.data);
  while (token) {
    let result = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'id,contentDetails,snippet',
        id: ID,
        key: apiKey,
        pageToken: token
      }
    })
    token = result.data.nextPageToken;
    resultArr.push(result.data);
  }
  return resultArr;
};


function showActiveSong() {
  $('.song-list-item').removeClass('active')
  $('.song-name:contains(' + $('#song-title').text() + ')').parent().parent().addClass('active')
}


// * Get Title, id, artist, duration 
//! GET DEFAULT PLAYLIST
getPlayListItems("PL7ZciLEZ0K4j9_7OFeuAJIs9LBcoEj_he")
  .then(data => {
    data.forEach(item => {
      item.items.forEach(i => listVid.push({ title: i.snippet.title, idVid: i.snippet.resourceId.videoId, artist: i.snippet.channelTitle }));
      var list = item.items.map(a => (a.snippet.resourceId.videoId))

      getVideosItems(list.toString()).then(data => {
        data.forEach(item => {
          item.items.forEach((i, index) => {
            listVid[index].duration = YTDurationToSeconds(i.contentDetails.duration)
          })
        })
        listVid.forEach(i => {
          $('.song-list-default').append(renderItem(i.title, i.artist, i.idVid, i.duration))
          setOnClickSong()
        })
      }).catch(err => {
        console.log(err)
      });
    });

    // * create random index
    rand = Math.floor(Math.random() * listVid.length);

    checkPrivate();
    tag.src = "https://www.youtube.com/iframe_api";
    var firstScriptTag = document.getElementsByTagName('script')[0];
    firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
  })
  .catch(err => {
    console.log(err)
    changeAPIKey(apiKeyList[1], err);
  });


var listDuration = []


//* convert YT api to hh:mm:ss
function YTDurationToSeconds(duration) {
  var reptms = /^PT(?:(\d+)H)?(?:(\d+)M)?(?:(\d+)S)?$/;
  var hours = 0, minutes = 0, seconds = 0, totalseconds;

  if (reptms.test(duration)) {
    var matches = reptms.exec(duration);
    if (matches[1]) hours = Number(matches[1]);
    if (matches[2]) minutes = Number(matches[2]);
    if (matches[3]) seconds = Number(matches[3]);
    var totalseconds = hours * 3600 + minutes * 60 + seconds;
    if (seconds < 3600) {
      return new Date(totalseconds * 1000).toISOString().substring(14, 19)
    } else {
      return new Date(totalseconds * 1000).toISOString().substring(11, 16)
    }
  }
}

function changeAPIKey(newKey, err) {
  console.log(err.response)
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





//*get suggest youtube
function getSearchSuggest(input) {
  $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent('http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=' + input), function (data) {
    getListSuggest(data.contents)
  });
};


//* setvolume 
$('.volume').on('input', function () {
  player.setVolume(this.value)
  var value = (this.value - this.min) / (this.max - this.min) * 100
  this.style.background = 'linear-gradient(to right, #ff2152 0%, #ff2152 ' + value + '%, #fff ' + value + '%, white 100%)'
})

var onChangeTime = false


//* set time play
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

//! cách này hơi ngu nhưng phải dùng vì nếu dùng youtube API thì ngốn quota vcl =)), search 100 bài hết mẹ quota của ngày
function getIdVideoBySearch(query) {
  $('.suggestItem').remove()
  $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent('https://www.youtube.com/results?search_query=' + query), function (data) {
    var index = data.contents.toString()
    var indexIndexOf = index.indexOf('/watch?v=') + 9
    var result = index.slice(indexIndexOf, indexIndexOf + 11)
    addVideoBySearch(result)
  });
}

// { title: "MONO - 'Quên Anh Đi' (Exclusive Performance Video)", idVid: "wwPYl5YizXg", artist: "Mono Official", duration: "04:13" }
var listVidUser = []

function addVideoBySearch(id) {
  console.log(id)
  // playMusicById(id)
  getVideosItems(id).then(data => {
    data.forEach(item => {
      console.log(item.items)
      item.items.forEach((i, index) => {
        var title = i.snippet.title
        var artist = i.snippet.channelTitle
        var duration = YTDurationToSeconds(i.contentDetails.duration)
        listVidUser.unshift({ title: title, idVid: id, artist: artist, duration: duration })
        playMusicById(id)
        $('.song-list-user').append(renderItem(title, artist, id, duration))
        $('#song-title').text(title);
        $('#song-artist').text(artist)
        $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`);
        showActiveSong()
        setOnClickSong()
      })
    })
    $('.song-list-default').css('opacity', '0.2');
  }).catch(err => {
    console.log(err)
  });
}



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
  $('#song-artist').text(listVid[rand].artist)
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${listVid[rand].idVid}/maxresdefault.jpg`);
  // console.log(listVid[rand].idVid)

  setInterval(function () {
    showActiveSong()
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
  $('#song-title').text(listVid[rand].title);
  playButton(player.getPlayerState() !== 5);
}

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
  if (loopStatus == 1) {
    $('#loopBtn').attr("xlink:href", "#loop");
    loopStatus = 0;
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
  showActiveSong()
  playButton(true);
}

//next song
function nextSong() {
  if (loopStatus == 1) {
    repeat.style.opacity = "0.3";
    loopStatus = 0;
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
  showActiveSong()
  playButton(true);

}


function playMusicById(id) {
  player.loadVideoById(id);
}

// on Song end
function nextVideo() {
  if (loopStatus == 1) {
    //TODO về sau đổi thành nếu loop=1 thì không xóa bài hiện tại, tiếp tục phát, còn không thì phát xong phát xóa luôn
    player.loadVideoById({ videoId: listVid[rand].idVid });
  } else {
    rand = Math.round(Math.random() * listVid.length);
    checkPrivate();
    var id = listVid[rand].idVid;
    player.loadVideoById({ videoId: id });
    $('#song-title').text(listVid[rand].title);
    $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${id}/maxresdefault.jpg`);
    showActiveSong()
  }

}

//Repeat
function loopVideo() {
  if (loopStatus == 0) {
    $('#loopBtn').attr("xlink:href", "#loop-active");
    loopStatus = 1;
  } else {
    $('#loopBtn').attr("xlink:href", "#loop");
    loopStatus = 0;
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


//* AUTO complete

function renderSuggest(item) {
  $('#search').val().length
  return `<div class="suggestItem"><strong>${item.slice(0, $('#search').val().length)}</strong>${item.slice($('#search').val().length)}<input type="hidden" value="${item}"></div>`
}


// $("#search").input(function () {
//   getSearchSuggest(this.val)
// });

$('#search').on('input', function (e) {
  $('#search').val() ? getSearchSuggest($('#search').val()) : $('.suggestItem').remove()

});

function getListSuggest(data) {
  var ListSuggest = JSON.parse(data)[1]
  autocomplete(document.getElementById("search"), ListSuggest);
}

function autocomplete(inp, arr) {
  $('.suggestItem').remove()
  arr.forEach(item => {
    $('#autocomplete-list').append(renderSuggest(item))
  })
  var currentFocus;
  currentFocus = -1;

  inp.addEventListener("keydown", function (e) {
    if (e.keyCode == 40) {
      currentFocus++;
      addActive(currentFocus);
    } else if (e.keyCode == 38) {
      currentFocus--;
      addActive(currentFocus);
    }
  });

  $(".suggestItem").click(function () {
    $('#search').val($(this).text())
    $('#search').focus()
    currentFocus = -1
  });

  function addActive(x) {
    removeActive()
    $('#search').val($(".suggestItem").eq(x).text())
    $(".suggestItem").eq(x).addClass('autocomplete-active');
  }

  function removeActive(x) {
    $(".suggestItem").removeClass('autocomplete-active');
  }

  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    $('.suggestItem').remove()
  });
}


//* random key connect
function rand_from_seed(x, iterations) {
  iterations = iterations || 100;
  for (var i = 0; i < iterations; i++)
    x = (x ^ (x << 1) ^ (x >> 1)) % 10000;
  return x;
}

function getDDMM() {
  const today = new Date();
  const yyyy = today.getFullYear();
  let mm = today.getMonth() + 1; // Months start at 0!
  let dd = today.getDate();
  return dd*100+mm
}

$('.pin').text(rand_from_seed(getDDMM()))



//* onclick on someone song
function setOnClickSong() {
  $(".song-list-item").prop("onclick", null).off("click");
  $(".song-list-item").on("click", function () {
    var songTitle = $(this).children('div').children('div').children('h3').text()
    console.log(songTitle);
    console.log(listVid.find(({ title }) => title === songTitle))
    playByClick(listVid.find(({ title }) => title === songTitle))
  });
}

function playByClick(data) {
  playMusicById(data.idVid)
  // $('.song-list-user').append(renderItem(title, artist, id, duration))
  $('#song-title').text(data.title);
  $('#song-artist').text(data.artist)
  $("#album-cover-image").attr("src", `https://i3.ytimg.com/vi/${data.idVid}/maxresdefault.jpg`);
  showActiveSong()
  setOnClickSong()
}