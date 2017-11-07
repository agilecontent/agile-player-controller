define(['agile-app', '../components/deviceManager', 'config', '../components/streamMapOrden', ], function(Agile, deviceManager, config, streamMapOrden) {
    'use strict';

	return Agile.EndpointCommand.extend({

        url: config.streamingsURL,

        method: 'GET',

        preventCache: true,

        _streamSize: 5,

        onSuccess: function(data, options, status, xhr) {
            options = options || {};

            this._diffWithClient = options.diffWithClient || this._diffWithClient;

            data = this._prepareData(data);

            var programData = {
                diffWithClient: this._diffWithClient,
                data: data
            };

            this.triggerToModule('init:stream:sources', this._setMultipleStreamSources(data));

            this.triggerToModule('init:scheduler:program', programData);
        },


        _prepareData: function(data) {
            var i = 0, l = data.length, streamMap = {}, orden;

            var dataResult = this._initProgramData(data);

            for (; i < l; i++) {
                dataResult[i].id = data[i].id;
                dataResult[i].textLive = data[i].textLive;
                var k = data[i].streamings.length,  j = 0;
                for (; j < k; j++) {
                  dataResult[i].streamings[j] = data[i].streamings[j];
                  /*orden = streamMapOrden[data[i].streamings[j].type];
                  dataResult[i].streamings[j].orden = orden;
                  */
                  dataResult[i].streamings[j].orden = j+1;
                }

                dataResult[i].streamings.sort(function (a, b) {
                  return a.orden > b.orden;
                })
            }
            dataResult.sort(function(a, b) {
                return a.orden > b.orden;
            });
            return dataResult;
        },

        _initProgramData: function(dataBG) {
          var data = [], i = 0, j = 0, ordenS, ordenBG;
          for (; i < dataBG.length; i++) {
            ordenBG = i + 1;
            data.push({
              id: 0,
              orden: ordenBG,
              textLive: "",
              streamings: []
            });
            var  j = 0;
            for (; j < dataBG[i].streamings.length; j++) {
              ordenS = j + 1;
              data[i].streamings.push({
                orden: ordenS,
                type: "",
                broadcasts: []
              });
            }
          }

            return data;
        },


        _checkVideoProgramType: function(data) {
            var programs = data.broadcasts, i = 0, l = programs.length;

            for (; i < l; i++) {
                if (programs[i].type === 'v') {
                    return true;
                }
            }

            return false;
        },


        _setStreamSources: function(data) {
            var key = 'url_streaming', i = 0, l = data.length, streamMap = {};

            for (; i < l; i++) {
                streamMap[j + 1] = data[i][key];
            }

            return streamMap;
        },

    _setMultipleStreamSources: function(data) {
      var key = 'url_streaming', i = 0, l = data.length, broadcastingMap = {};

      for (; i < l; i++) {
        var  j = 0, streamMap = {};
        for (; j < data[i].streamings.length; j++) {
          streamMap[j + 1] = data[i].streamings[j][key];
        }
        broadcastingMap[i+1] = streamMap;
      }

      return broadcastingMap;
    }
    });
});
