define(['agile-app'], function (Agile) {
  'use strict';

  return Agile.Command.extend({

    _streamSize: 5,

    _repeatTimer: 60000,

    _videoType: 'TY_STR_VIDEO',

    execute: function (data) {
      //this._initStreamsStorage();

      this._runningTimeout = this._runningTimeout || [];

      this._streams = {};

      this._clearTimeout();

      this._parseProgram(data);

      this._reloadTabsHeader();
    },

    _reloadTabsHeader: function () {
      // Create the event
      var event = new CustomEvent("reload-tabs-header", {});

      // Dispatch/Trigger/Fire the event
      document.dispatchEvent(event);
    },

    _initStreamsStorage: function (streamSize) {
      var i = 0, l = streamSize;

      this._currentBroadcastings = [];

      this._currentStreams = [];

      this._allDayEndProg = [];

      for (; i < l; i++) {
        this._currentStreams[i] = {
          stream: i + 1,
          play: false,
          program: false,
          isVideo: 0
        };
      }
    },


    _checkVideoStreaming: function (data) {
      for (var i = 0; i < data.length; i++) {
        if (data[i].type === this._videoType) {
          this._currentStreams[data.length - 1].isVideo = 1;
        }
      }
    },


    _parseProgram: function (data) {
      this._now = new Date(data.now).getTime();

      this._retrieveDate = Date.now();

      this._diffWithClient = data.diffWithClient;

      this._setPrgrmConf(data.data);
    },


    _setPrgrmConf: function (data) {

      var stream, streamNumber;

      for (var i = 0; i < data.length; i++) {
        this._initStreamsStorage (data[i].streamings.length)
        this._currentBroadcastings[i] = {
          order: data[i].orden,
          textLive: data[i].textLive,
          id: data[i].id,
          streamings: []
        }
        var dataStreamings = data[i].streamings;
        this._checkVideoStreaming(dataStreamings);

        for (var j = 0; j < dataStreamings.length; j++) {
          streamNumber = dataStreamings[j].orden;

          stream = this._initProgramMap(dataStreamings[j].broadcasts, streamNumber, data[i].orden, dataStreamings[j].type);

          this._setCanal(stream, streamNumber, this._currentBroadcastings[i]);
        }
      }

      this._allDayEndProg.sort(function (a, b) {
        return a - b;
      });
    },


    _manageStreams: function (prog, stream, brodcasting) {
      var event, tmpStream, antenaIndex, antena;

      stream = parseInt(stream, 10);

      if (prog.isAntenna) {
        this._sortStreams();

        tmpStream = this._currentStreams.splice(stream - 1, 1)[0];

        tmpStream.program = prog;

        if (tmpStream.isVideo)
          this._currentStreams.push(tmpStream);
        else
          this._currentStreams.unshift(tmpStream);

        event = 'set:antenna:programMultiple';
      } else {
        this._sortStreams();

        var index = this._getStreamIndex(stream);

        this._currentStreams[index].program = prog;
        if (prog === false && this._currentStreams[index].play) {
          this._currentStreams[index].play = false;


          this.triggerToModule('display:stream:msg', {
            msg: 'it seems that there is no more program on this chanel(' + stream + ') for now.'
          });
        }

        antenaIndex = this._searchForAntenna();

        antena = this._currentStreams.splice(antenaIndex, 1)[0];

        this._sortStreams(true);

        this._currentStreams.unshift(antena);

        event = 'set:programMultiple';
      }

      brodcasting.streamings=this._currentStreams;

      this.triggerToModule(event, brodcasting);
    },


    _getStreamIndex: function (stream) {
      var i = 0, l = this._currentStreams.length;
      for (; i < l; i++) {
        if (this._currentStreams[i].stream === stream) {
          return i;
        }
      }
    },


    _searchForAntenna: function () {
      var i = 0, l = this._currentStreams.length;
      for (; i < l; i++) {
        if (this._currentStreams[i].program && this._currentStreams[i].program.isAntenna) {
          return i;
        }
      }
    },


    _sortStreams: function (withFilter) {
      this._currentStreams.sort(function (a, b) {

        if (a.isVideo || b.isVideo) {
          return a.isVideo > b.isVideo;
        }

        if (!a.program && !b.program) {
          return a.stream > b.stream;
        }
        if (withFilter) {
          if (!a.program) {
            return 1;
          }

          if (!b.program) {
            return 0;
          }
        }
        return a.stream > b.stream;
      });
    },


    _getUTCCurrentDate: function () {
      return Date.now() + this._diffWithClient;
    },


    _buildMap: function (data, stream, broadcastGroup, streamType) {
      var start, end, next, programs = {}, i = 0, l = data.length, defaultProg = false;

      for (; i < l; i++) {
        if (data[i].isDefault) {
          defaultProg = data.splice(i, 1)[0];
          break;
        }
      }

      data.sort(function (a, b) {
        var startA = a.start,
          startB = b.start;

        if (startA > startB) {
          return 1;
        } else {
          return -1;
        }
      });

      for (i = 0; i < data.length; i++) {
        next = null;
        data[i].stream = streamType;

        start = parseInt(data[i].start, 10);
        end = parseInt(data[i].end, 10);

        if (i < data.length - 1) {
          next = parseInt(data[i + 1].start, 10);
        }

        programs[start] = data[i];

        if (next !== end) {
          programs[end] = defaultProg;
        }

        this._allDayEndProg.push(end);
      }
      if (this._streams[broadcastGroup] === undefined)
        this._streams[broadcastGroup]={};

      this._streams[broadcastGroup][stream] = programs;

      return programs;
    },


    _initProgramMap: function (data, stream, broadcastGroup, streamType) {
      var curr, diff, itm, availableKeys, now, currDiff, i, keys, programs;

      programs = this._buildMap(data, stream, broadcastGroup, streamType);

      availableKeys = [];

      now = this._getUTCCurrentDate();

      keys = Object.keys(programs);

      for (i = 0; i < keys.length; i++) {
        itm = parseInt(keys[i], 10);

        diff = itm - now;

        if ((curr === undefined && diff < 0) || (diff > currDiff && diff < 0)) {
          currDiff = diff;
          curr = itm;
        }

        if (diff > 0) {
          availableKeys.push(itm);
        }
      }

      availableKeys.sort(function (a, b) {
        return a - b;
      });

      availableKeys.unshift(curr);

      return availableKeys;
    },


    _setCanal: function (data, stream, brodcasting) {
      var current = data.shift(), end;

      if (current) {
        this._manageStreams(this._streams[brodcasting.order][stream][current], stream, brodcasting);
        end = this._streams[brodcasting.order][stream][current].end;
        this._programContentGroup(this._streams[brodcasting.order][stream][current]);
      }

      if (data.length) {
        this._scheduleNext(data, stream, end, brodcasting);
        this._nextProgram(data, stream, brodcasting);
      }
    },

    _programContentGroup: function (prog) {
      if (prog)
        this.trigger('module:update:programcontentgroup:data', prog);
    },

    _nextProgram: function (data, stream, brodcasting) {
      var i = 0, l = data.length, current, nextProg;
      for (;i < l; i++){
        current = data[i];
        nextProg = this._streams[brodcasting.order][stream][current];
        if (nextProg){
          this.trigger('module:update:nextprogram:data', nextProg);
          break;
        }
      }

    },

    _scheduleNext: function (data, stream, end, brodcasting) {
      var now = this._getUTCCurrentDate(), timeout, next, time;

      next = data[0];

      if (!next) {
        return;
      }

      time = next - now;

      timeout = setTimeout(Agile.bind(function () {
        this._checkForLastProg(end);
        this._deleteTimeout(timeout);
        this._setCanal(data, stream, brodcasting);
        this._reloadTabsHeader();
      }, this), time);

      this._runningTimeout.push(timeout);
    },

    _checkForLastProg: function (end) {
      var index = this._allDayEndProg.indexOf(end);

      if (index === this._allDayEndProg.length - 1) {
        this._waitToEndOfDay();
      }
    },


    _waitToEndOfDay: function () {
      var tomorrow, now, nowDay, serveDay, tomorrowServer, timeout;

      now = new Date(Date.now());
      nowDay = now.getDate();
      serveDay = new Date(now.getTime() + this._diffWithClient).getDate();

      if (nowDay !== serveDay) {
        return this._repeatChecking();
      }

      tomorrow = new Date(Date.now());

      tomorrow.setDate(nowDay + 1);
      tomorrow.setHours(0);
      tomorrow.setMinutes(1);
      tomorrow.setSeconds(0);
      tomorrow.setMilliseconds(0);

      tomorrowServer = tomorrow.getTime() + this._diffWithClient;

      timeout = tomorrowServer - now.getTime();

      setTimeout(Agile.bind(function () {
        this._repeatChecking();
      }, this), timeout);
    },


    _repeatChecking: function () {
      clearInterval(this._repeatInterval);

      this._repeatInterval = setInterval(Agile.bind(function () {
        this.triggerToModule('get:server:data');
      }, this), this._repeatTimer);
    },


    _deleteTimeout: function (timeout) {
      var index = this._runningTimeout.indexOf(timeout);

      this._runningTimeout.splice(index, 1)
    },


    _clearTimeout: function () {
      this._runningTimeout.map(clearTimeout);

      this._runningTimeout = [];

      clearTimeout(this._repeatInterval);
    },

    _prepareTriggerDataProgram: function (dataProg,dataStream) {
      return {
        url: dataStream,
        description: dataProg.host,
        hours: dataProg.hours,
        title: dataProg.title,
        stream: stream,
        host: dataProg.host,
        images: dataProg.as_hl
      };
    }
  });
});
