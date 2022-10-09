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


const getVideosItems = async ID => {
  var token;
  var resultArr = [];
  const result = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
    params: {
      part: 'id,contentDetails',
      id: ID,
      key: apiKey
    }
  })
  token = result.data.nextPageToken;
  resultArr.push(result.data);
  while (token) {
    let result = await axios.get(`https://www.googleapis.com/youtube/v3/videos`, {
      params: {
        part: 'id,contentDetails',
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



// * Get Title, id, artist, duration
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
        listVid.forEach(i => $('.song-list').append(renderItem(i.title, i.artist, i.idVid, i.duration)))
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





//! Cái này chiếm quota vcl, request ít thôi
function getSearchSuggest(input) {
  $.getJSON('https://api.allorigins.win/get?url=' + encodeURIComponent('http://suggestqueries.google.com/complete/search?client=firefox&ds=yt&q=' + input), function (data) {
    // var result = data.contents;
    getListSuggest(data.contents)
    // console.log(result);
  });
};
// function getSearchSuggest(input) {
//   const result = axios.get(`https://www.googleapis.com/youtube/v3/search`, {
//     params: {
//       part: 'snippet',
//       q: input,
//       key: 'AIzaSyB56E3cgBh0TMpNi5WQJT9AMFtChFIeEIo'
//     }
//   })
//   return result;
// };


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
  // btn.show()
  // prev.show()
  // next.show()
  // btn2.show()
  // repeat.show()
  // form.style.display = "flex";
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


//* AUTO complete

function renderSuggest(item) {
  return `<div class="suggestItem"><strong></strong>${item}<input type="hidden" value="${item}"></div>`
}


// $("#search").input(function () {
//   getSearchSuggest(this.val)
// });

$('#search').keyup(function (e) {
  $('#search').val() ? getSearchSuggest($('#search').val()) : $('.suggestItem').remove()
  
});

function getListSuggest(data) {
  var ListSuggest = JSON.parse(data)[1]
  console.log(ListSuggest)
  autocomplete(document.getElementById("search"), ListSuggest);
}

function autocomplete(inp, arr) {
  $('.suggestItem').remove()
  arr.forEach(item => {
    $('#autocomplete-list').append(renderSuggest(item))
  })
  /*the autocomplete function takes two arguments,
  the text field element and an array of possible autocompleted values:*/
  var currentFocus;
  /*execute a function when someone writes in the text field:*/

  // inp.addEventListener("input", function (e) {
  //   var a, b, i, val = this.value;
  //   /*close any already open lists of autocompleted values*/
  //   closeAllLists();
  //   // if (!val) { return false; }
  //   currentFocus = -1;
  //   /*create a DIV element that will contain the items (values):*/
  //   a = document.createElement("DIV");
  //   a.setAttribute("id", this.id + "autocomplete-list");
  //   a.setAttribute("class", "autocomplete-items");
  //   /*append the DIV element as a child of the autocomplete container:*/
  //   this.parentNode.appendChild(a);
  //   /*for each item in the array...*/
  //   for (i = 0; i < arr.length; i++) {
  //     /*check if the item starts with the same letters as the text field value:*/
  //     // if (arr[i].substr(0, val.length).toUpperCase() == val.toUpperCase()) {
  //       /*create a DIV element for each matching element:*/
  //       b = document.createElement("DIV");
  //       /*make the matching letters bold:*/
  //       b.innerHTML = "<strong>" + arr[i].substr(0, val.length) + "</strong>";
  //       b.innerHTML += arr[i].substr(val.length);
  //       /*insert a input field that will hold the current array item's value:*/
  //       b.innerHTML += "<input type='hidden' value='" + arr[i] + "'>";
  //       /*execute a function when someone clicks on the item value (DIV element):*/
  //       b.addEventListener("click", function (e) {
  //         /*insert the value for the autocomplete text field:*/
  //         inp.value = this.getElementsByTagName("input")[0].value;
  //         /*close the list of autocompleted values,
  //         or any other open lists of autocompleted values:*/
  //         closeAllLists();
  //       });
  //       a.appendChild(b);
  //     // }
  //   }
  // });
  /*execute a function presses a key on the keyboard:*/
  inp.addEventListener("keydown", function (e) {
    var x = document.getElementById(this.id + "autocomplete-list");
    if (x) x = x.getElementsByTagName("div");
    // console.log(x)
    if (e.keyCode == 40) {
      /*If the arrow DOWN key is pressed,
      increase the currentFocus variable:*/
      currentFocus++;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 38) { //up
      /*If the arrow UP key is pressed,
      decrease the currentFocus variable:*/
      currentFocus--;
      /*and and make the current item more visible:*/
      addActive(x);
    } else if (e.keyCode == 13) {
      /*If the ENTER key is pressed, prevent the form from being submitted,*/
      e.preventDefault();
      if (currentFocus > -1) {
        /*and simulate a click on the "active" item:*/
        if (x) x[currentFocus].click();
      }
    }
  });
  function addActive(x) {
    /*a function to classify an item as "active":*/
    if (!x) return false;
    /*start by removing the "active" class on all items:*/
    removeActive(x);
    if (currentFocus >= x.length) currentFocus = 0;
    if (currentFocus < 0) currentFocus = (x.length - 1);
    /*add class "autocomplete-active":*/
    x[currentFocus].classList.add("autocomplete-active");
  }
  function removeActive(x) {
    /*a function to remove the "active" class from all autocomplete items:*/
    for (var i = 0; i < x.length; i++) {
      x[i].classList.remove("autocomplete-active");
    }
  }
  /*execute a function when someone clicks in the document:*/
  document.addEventListener("click", function (e) {
    $('.suggestItem').remove()
  });
}
