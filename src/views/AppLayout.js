define([
  'agile-app',
  './PlayerView',
  './PlaylistView',
  './ControlPanelView',
  './StationView',
  '../components/deviceManager',
  './DetailPlayerView',
  './StickyView',
  './NextProgramView'


], function (Agile, PlayerView, PlaylistView, ControlPanelView, StationView, deviceManager, DetailPlayerView, StickyView, NextProgramView) {
  'use strict';

  return Agile.View.extend({

    bindedTo: 'body',

    _headerMultipleDirectClass: 'varios-directos',

    viewContainers: {
      controlPanel: '[data-selector="control-panel"]',
      playlist: '[data-selector="playlist"]',
      player: '[data-selector="player-view"]',
      detailPlayer: '[data-selector="streaming-detail-view"]',
      nextProgram: '[data-selector="nextProgram-view"]'
    },

    ui: {
      localStation: '[data-selector="local-station-container"]',
      header: 'header'
    },

    moduleEvents: {
      'close:station:popup': '_onClosePopup',
      'show:many:direct': '_onShowManyDirect',
      'show:only:one:direct': '_onShowOneDirect'
    },

    _instanciateViews: function () {
      var isDirectView = false;
      if (this.playlist._isBinded) {
        this._playlistView = this.createView(PlaylistView);
      }

      if (this.player._isBinded) {
        this._playerView = this.createView(PlayerView);
      }

      if (this.detailPlayer._isBinded) {
        this._detailPlayerView = this.createView(DetailPlayerView);
        isDirectView = true;
      }

      if (this.nextProgram._isBinded) {
        this._nextProgramView = this.createView(NextProgramView);
      }

      if (this.controlPanel._isBinded) {
        this._controlPanel = this.createView(ControlPanelView, {
          isDirectView: isDirectView
        });
      }

      this._stickyView = this.createView(StickyView);

      this._stationView = this.createView(StationView);

    },

    onBinding: function () {
      if (deviceManager.isMobile()) {
        this.listenTo(deviceManager, 'app:awake', this._onAppAwake);
      }

      this._instanciateViews();

      this.trigger('module:set:reload:timer');

      this.trigger('module:set:call:url:timer');
    },

    _onShowManyDirect: function () {
      this.ui.header.addClass(this._headerMultipleDirectClass);
    },

    _onShowOneDirect: function () {
      this.ui.header.removeClass(this._headerMultipleDirectClass);
    },

    _onAppAwake: function () {
      this.trigger('module:retrieve:program');
    },

    _toggleLocalStationView: function (e) {
      e.preventDefault();

      if (!this._stationView) {
        this._stationView = this.createView(StationView);
      }

      this.ui.localStation.toggle();
    },

    _onClosePopup: function () {
      this.ui.localStation.hide();
    },

    onClose: function () {
      this.stopListenTo(deviceManager, 'app:awake', this._onAppAwake);
    }
  });
});
