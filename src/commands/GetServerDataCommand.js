define(['agile-app', 'config'], function(Agile, config) {
    'use strict';

	return Agile.EndpointCommand.extend({

        url: config.serverDateURL,

        method: 'GET',

        preventCache: true,

        onSuccess: function(data, options, status, xhr) {
            var diff, changeDay;

            options = options || {};

            if (options.debugDate) {
                data = options.debugDate;
            }

            diff        = parseInt(data, 10) - Date.now();
            changeDay   = this._checkDayChange(data);

            if (!changeDay && !options.force) {
                return false;
            }

            if (options.force) {
              this.triggerToModule('clean:programMultiple',{})
            }

            this.triggerToModule('retrieve:program', {
                diffWithClient: diff,
                changeDay: changeDay
            });
        },


        _checkDayChange: function(date) {
            date = new Date(date);

            if (!this._servedate) {
                this._servedate = date;
                return true;
            }

            if (this._servedate.getDate() !== date.getDate()) {
                this._servedate = date;
                return true;
            }

            return false;
        }
    });
});
