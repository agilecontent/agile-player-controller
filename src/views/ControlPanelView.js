define(['agile-app', '../components/storageManager'], function (Agile, storageManager) {
  'use strict';

  return Agile.View.extend({

    bindedTo: '[data-selector="control-panel"]',

    _states: {
      PLAYING: 'playing',
      STOPPED: 'stopped',
    },

    ui: {
      listBroadcastings: 'ul[data-selector="panel-broadcastings"]',
      listStreamings: 'div[data-selector="list-streamings"]',

      stream1: 'div[data-selector="canal1"]',
      stream2: 'div[data-selector="canal2"]',
      stream3: 'div[data-selector="canal3"]',
      stream4: 'div[data-selector="canal4"]',
      stream5: 'div[data-selector="canal5"]',

      description: 'div[data-selector="author"]',

      streamTitle1: 'div[data-selector="canal1"] p[data-selector="title"]',
      streamTitle2: 'div[data-selector="canal2"] p[data-selector="title"]',
      streamTitle3: 'div[data-selector="canal3"] [data-selector="title"]',
      streamTitle4: 'div[data-selector="canal4"] [data-selector="title"]',
      streamTitle5: 'div[data-selector="canal5"] [data-selector="title"]',

      description1: 'div[data-selector="canal1"] [data-selector="description"]',
      description2: 'div[data-selector="canal2"] [data-selector="description"]',
      description3: 'div[data-selector="canal3"] [data-selector="description"]',
      description4: 'div[data-selector="canal4"] [data-selector="description"]',
      description5: 'div[data-selector="canal5"] [data-selector="description"]',

      hour1: 'div[data-selector="canal1"] [data-selector="hour"]',
      hour2: 'div[data-selector="canal2"] [data-selector="hour"]',

      img1: 'div[data-selector="canal1"] img',
      img2: 'div[data-selector="canal2"] img',

      playBtn1: 'div[data-selector="canal1"] a[data-selector="btn_play"]',
      playBtn2: 'div[data-selector="canal2"] a[data-selector="btn_play"]',
      playBtn3: 'div[data-selector="canal3"] a[data-selector="btn_play"]',
      playBtn4: 'div[data-selector="canal4"] a[data-selector="btn_play"]',
      playBtn5: 'div[data-selector="canal5"] a[data-selector="btn_play"]',

      auxPlayer: 'div[data-selector="aux-player"]',
      vidPlayer: 'div[data-selector="vid-player"]'
    },

    events: {
      'click [data-selector="btn_play"]': '_onPlayClick'
    },


    moduleEvents: {
      'set:program': '_changeHeader',
      'set:programMultiple': '_changeMultipleHeader',
      'set:antenna:program': '_changeHeader',
      'set:antenna:programMultiple': '_changeMultipleHeader',
      'reset:play:btn:panel': '_reinitPlayBtnState',
      'init:stream:sources': '_onStreamRetrieve',
      'set:play:btn:panel': '_onSetPlayBtn',
      'clean:programMultiple': '_cleanMultipleHeader'
    },


    initialize: function (options) {
      this._streams = [];

      this._isDirectView = options.isDirectView;
    },


    onBinding: function () {
      if (this.ui.listBroadcastings.length > 0) {
        if (this._streams.length) {
          this._updateMultipleUI();
        }
      }
      else {
        this._initUI();
        if (this._streams.length) {
          this._updateUI();
        }
      }

    },


    _initUI: function () {
      this.ui.playBtn1[0].dataset.placeholder = 1;
      this.ui.playBtn2[0].dataset.placeholder = 2;
      this.ui.playBtn3[0].dataset.placeholder = 3;
      this.ui.playBtn4[0].dataset.placeholder = 4;
      this.ui.playBtn5[0].dataset.placeholder = 5;

      this._reinitPlayBtnState();
    },


    _changeHeader: function (data) {
      var i = 0, l = data.length, countProg;

      this._streams = data;

      this._reinitPlayBtnState();

      for (; i < l; i++) {
        var dataExist = this._checkAlreadyExist(data[i]);
        if (!dataExist) {
          this._setUIChange(data[i], this._whereShouldIPut(data[i], i) + 1);
        }
      }

      countProg = this._countProg(data);

      if (countProg === 1) {
        this._showDescription();
        this._removeSmallClass();
      } else {
        this._hideDescription();
        this._addSmallClass();
      }
    },

    _cleanMultipleHeader: function () {
      $('ul[data-selector="panel-broadcastings"] li').not(':first').remove();
      $('div[data-selector="list-streamings"] div.list').remove();
    },

    _changeMultipleHeader: function (data) {
      var i = 0, l = data.streamings.length, countProg;

      this._streams = data.streamings;

      this._reinitPlayBtnState();

      if ($("#owlCarouselHeader" + data.order).children().length > 0) {
        var owl = document.createElement('div');
        owl.id = "owlCarouselHeader"+data.order;
        owl.className = "owl-carousel owl-theme";
        $("#owlCarouselHeader" + data.order).parent().html(owl);
      }

      var dataBroadcastingExist = this._checkBrAlreadyExist(data);
      if (!dataBroadcastingExist) {
        this._setBroadcastingUI(data);
      }

      var dataStreamingCarouselExsist = this._checkStreamingCarouselAlreadyExist(data);
      if (!dataStreamingCarouselExsist) {
        this._setStreamingCarouselUI(data);
      }

      for (; i < l; i++) {
        var dataStreamingExist = this._checkMultipleAlreadyExist(data.streamings[i], data.order);
        if (!dataStreamingExist) {
          this._setUIMultipleChange(data.streamings[i], data.order);
        }
      }
      if ($("#owlCarouselHeader" + data.order).children().length === 0) {
        $("#tabHeader" + data.order).remove();
        $("#tabTitle" + data.order).remove();
      }
    },

    _countProg: function (data) {
      var i = 1, l = data.length, countProg = 0, streamName;
      for (; i <= l; i++) {
        streamName = 'stream' + i;
        if (this.ui[streamName].css('display') != "none" && i != 5)
          ++countProg;
      }
      return countProg;
    },

    _whereShouldIPut: function (data, position) {
      var dataDiv = document.querySelector('div[data-streaming-id="' + data.program.programId + '-' + data.program.start + '-' + data.program.end + '"]');
      if (dataDiv != null)
        position = parseInt(dataDiv.getAttribute('data-selector').substring(5)) - 1;
      return position;
    },

    _checkBrAlreadyExist: function (data) {
      var dataDiv = document.querySelector('li[data-broadcasting-id="' + data.id + '"]');
      if (dataDiv != null)
          return true;
      else
        return false;
    },

    _checkStreamingCarouselAlreadyExist: function (data) {
      var dataDiv = document.querySelector('div[id="tabHeader' + data.order + '"]');
      if (dataDiv != null)
        return true;
      else
        return false;
    },

    _checkMultipleAlreadyExist: function (data, broadcasting) {
      if (data.program) {
        var dataDiv = document.querySelector('div[id="tabHeader'+broadcasting+'"] div[data-streaming-id="' + data.program.programId + '-' + data.program.start + '-' + data.program.end + '"]');
        if (dataDiv != null)
          if (data.program.isAntenna && dataDiv.getAttribute('data-antenna') == "false")
            return false;
          else
            return true;
        else
          return false;
      } else
        return false;
    },

    _checkAlreadyExist: function (data) {
      if (data.program) {
        var dataDiv = document.querySelector('div[data-streaming-id="' + data.program.programId + '-' + data.program.start + '-' + data.program.end + '"]');
        if (dataDiv != null)
          if (data.program.isAntenna && dataDiv.getAttribute('data-antenna') == "false")
            return false;
          else
            return true;
        else
          return false;
      } else
        return false;
    },


    _updateUI: function () {
      var l = this._streams.length, i = 0;

      for (; i < l; i++) {
        this._setUIChange(this._streams[i].program, i + 1);
      }
    },

    _updateMultipleUI: function () {
      var l = this._streams.length, i = 0;

      for (; i < l; i++) {
        this._setUIMultipleChange(this._streams[i].program, i + 1);
      }
    },


    _setUIChange: function (data, placeholder) {
      var streamName, btnStream, prgrm, streamTitle, description, hour, img, display = 'block';

      prgrm = data.program;
      streamName = 'stream' + placeholder;
      btnStream = 'playBtn' + placeholder;
      streamTitle = 'streamTitle' + placeholder;
      description = 'description' + placeholder;
      hour = 'hour' + placeholder;
      img = 'img' + placeholder;

      this._checkAuxPlayer();
      this._checkVideoPlayer();

      this.ui[btnStream][0].dataset.stream = data.stream;

      if (data.play && prgrm) {
        this._playingStream = data.stream;
        this._setPlayBtnState(placeholder, true);
      }

      this.trigger('module:update:player:data', this._prepareTriggerData(data.stream, placeholder));


      if (prgrm === false) {
        return this.ui[streamName].hide();
      }

      if (this.ui[hour]) {
        this.ui[hour].text('');
        this.ui[hour].text(prgrm.hours);
      }

      if (this.ui[img]) {
        this.ui[img].attr('src', '');
        var src = prgrm.image;
        this.ui[img].attr('src', src);
      }

      this.ui[description].text('');
      this.ui[description].text(prgrm.host);

      this.ui[btnStream].show();

      this.ui[streamTitle].text('');
      this.ui[streamTitle].text(prgrm.title);

      this.ui[streamName].css('display', '');

      this.ui[btnStream].attr('href', '');
      this.ui[btnStream].attr('href', this._streamMap[data.stream]);
      this.ui[streamName][0].dataset.streamingId = data.program.programId + '-' + data.program.start + '-' + data.program.end;
      this.ui[streamName][0].dataset.antenna = data.program.isAntenna;
    },

    _setBroadcastingUI: function (data) {
      var li = document.createElement("li");
      var a = document.createElement('a');
      var linkText = document.createTextNode(data.textLive);
      a.appendChild(linkText);
      a.className = "btn"+(1+data.order);
      a.href = "#tabHeader"+data.order;
      li.className ="item";
      li.id = "tabTitle"+data.order;
      li.dataset.broadcastingId = data.id;
      li.appendChild(a);
      this.ui.listBroadcastings.append(li);
    },

    _setStreamingCarouselUI: function (data) {
      var list = document.createElement("div");
      var owl = document.createElement('div');
      owl.id = "owlCarouselHeader"+data.order;
      owl.className = "owl-carousel owl-theme";
      list.className ="list";
      list.id = "tabHeader"+data.order;
      list.appendChild(owl);

      this.ui.listStreamings.append(list);
    },



    _setUIMultipleChange: function (data, broadcasting) {
      var prgrm = data.program;

      var item = document.createElement("div"), headerItem = document.createElement("div"), left = document.createElement("div"), center = document.createElement("div"), right = document.createElement("div");
      var img = document.createElement("img"), titPlayer= document.createElement("p"), authorPlayer = document.createElement("span"), hourPlayer = document.createElement("span"), btnIcon = document.createElement("span"), link = document.createElement("a"), icon = document.createElement("i");

      if (prgrm !== false) {
        item.className = "item";
        headerItem.className = "modHeaderPlayer";
        left.className = "left";
        center.className = "center";
        right.className = "right ";/* play or pause */
        titPlayer.className = "titPlayer";
        authorPlayer.className = "authorPlayer";
        hourPlayer.className = "horaPlayer";
        btnIcon.className = "btnIcon iconPlay";
        icon.className = "icon-";

        item.dataset.streamingId = data.program.programId + '-' + data.program.start + '-' + data.program.end;
        item.dataset.antenna = data.program.isAntenna;


        this.trigger('module:update:player:data', this._prepareMultipleTriggerData(data.stream, broadcasting, prgrm));

        var src = prgrm.image;
        img.setAttribute('src', src);

        var titText = document.createTextNode(prgrm.title);
        titPlayer.appendChild(titText);

        var authorText = document.createTextNode(prgrm.host);
        authorPlayer.appendChild(authorText);


        var hourText = document.createTextNode(prgrm.hours);
        hourPlayer.appendChild(hourText);

        if (data.play) {
          right.dataset.state = this._states.PLAYING;
          right.classList.add('pause');
        } else {
          right.dataset.state = this._states.STOPPED;
          right.classList.add('play');
        }

        link.setAttribute('target','window_player');
        link.setAttribute('href', this._streamMap[broadcasting][data.stream]);
        right.dataset.stream = data.stream;

        link.appendChild(icon);
        btnIcon.appendChild(link);
        right.appendChild(btnIcon);
        center.appendChild(titPlayer);
        center.appendChild(authorPlayer);
        center.appendChild(hourPlayer);
        left.appendChild(img);
        headerItem.appendChild(left);
        headerItem.appendChild(center);
        headerItem.appendChild(right);
        item.appendChild(headerItem);
        if (data.program.isAntenna){
          $("#owlCarouselHeader" + broadcasting).prepend(item);
        } else {
          $("#owlCarouselHeader" + broadcasting).append(item);
        }
      }
    },

    _addSmallClass: function () {
      this.ui.stream1.addClass('small');
    },

    _removeSmallClass: function () {
      this.ui.stream1.removeClass('small');
    },

    _showDescription: function (data) {
      this.ui.description.css('display', '');

      this.trigger('module:show:only:one:direct');
    },

    _hideDescription: function () {
      this.trigger('module:show:many:direct');
      this.ui.description.css('display', 'none');
    },

    _checkAuxPlayer: function () {
      if (this._streams[2].program === false && this._streams[3].program === false) {
        return this.ui.auxPlayer.removeClass('visible');
      } else if (this._countProg(this._streams) < 3) {
        return this.ui.auxPlayer.removeClass("visible");
      }
      this.ui.auxPlayer.addClass('visible');
    },

    _checkVideoPlayer: function () {
      if (this._streams[4].program === false) {
        return this.ui.vidPlayer.removeClass('visible');
      }

      this.ui.vidPlayer.addClass('visible');
    },

    _prepareMultipleTriggerData: function (stream, broadcasting, dataProg) {
      var streamLocal = storageManager.getLocalStation() || {};
      var dataStream = streamLocal[stream] || this._streamMap[broadcasting][stream];

      return this._prepareTriggerDataProgram(dataProg,dataStream,dataProg.stream);
    },


    _prepareTriggerData: function (stream, placeholder) {
      var dataProg = this._streams[placeholder - 1].program;
      var streamLocal = storageManager.getLocalStation() || {};
      var dataStream = streamLocal[stream] || this._streamMap[stream];

      return this._prepareTriggerDataProgram(dataProg,dataStream,stream);
    },

    _prepareTriggerDataProgram: function (dataProg,dataStream,stream) {
      return {
        url: dataStream,
        description: dataProg.host,
        hours: dataProg.hours,
        title: dataProg.title,
        stream: stream,
        host: dataProg.host,
        images: dataProg.as_hl
      };
    },


    _pingpongCallback: function (e) {
      if (e.value === 'pong') {
        clearTimeout(this.__tmpOpener);
        this.stopListenTo(this.controller.vent, 'module:storage:on:pingpong', this._pingpongCallback);
      }
    },


    _triggerPlay: function (stream, placeholder) {

      var data = this._prepareTriggerData(stream, placeholder);

      var win;

      if (this._isDirectView) {
        return this.trigger('module:reload:page:to:url', {
          value: data.url
        });
      }

      this.stopListenTo(this.controller.vent, 'module:storage:on:pingpong', this._pingpongCallback);

      this.listenTo(this.controller.vent, 'module:storage:on:pingpong', this._pingpongCallback);

      this.__tmpOpener = setTimeout(function () {
        win = window.open(data.url, '_blank');
        storageManager.setWindow(win);
      }, 1000);

      storageManager.setPing(data.url);
    },


    _triggerStop: function () {
      this.trigger('module:stop:video');
    },


    _reinitPlayBtnState: function () {
      var i = 1, l = 6, btnStream;

      for (; i < l; i++) {
        btnStream = 'playBtn' + i;
        if (this.ui[btnStream].length > 0) {
          this.ui[btnStream][0].dataset.state = this._states.STOPPED;
          this.ui[btnStream].removeClass('pause');
        }
      }
    },


    _onSetPlayBtn: function (data) {
      var i = 1, l = 6, btnStream;

      this._reinitPlayBtnState();

      for (; i < l; i++) {
        btnStream = 'playBtn' + i;
        if (parseInt(this.ui[btnStream][0].dataset.stream, 10) === data.stream) {
          this._updateStreamObject(data.stream, true);
          return this._setPlayBtnState(this.ui[btnStream][0].dataset.placeholder, true);
        }
      }
    },


    _onStreamRetrieve: function (data) {
      this._streamMap = data;
    },


    _setPlayBtnState: function (placeholder, isPlaying) {
      var btnStream = 'playBtn' + placeholder;

      if (isPlaying) {
        this.ui[btnStream][0].dataset.state = this._states.PLAYING;

        this.ui[btnStream].addClass('pause');

      }

    },

    _updateStreamObject: function (streamToPlay, isPlaying) {
      this._streams.map(function (itm) {
        itm.play = false;
        if (streamToPlay === itm.stream && isPlaying) {
          itm.play = true;
        }
      });
    },


    _onPlayClick: function (e) {
      var stream, placeholder, state, isPlaying, target;

      target = $(e.target).parents('[data-selector="btn_play"]')[0];

      stream = parseInt(target.dataset.stream, 10);

      placeholder = parseInt(target.dataset.placeholder, 10);

      state = target.dataset.state;

      isPlaying = !(state === this._states.PLAYING);


      this._updateStreamObject(stream, isPlaying);

    }
  });
});
