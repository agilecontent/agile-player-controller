define(['agile-app', 'config'], function(Agile, config) {
    'use strict';

	return Agile.EndpointCommand.extend({

        url: config.serverLastDateURL,

        method: 'GET',

        preventCache: true,

        onSuccess: function(data, options, status, xhr) {

            if (this.__date !== data) {
                this.triggerToModule('get:server:data', {
                    force: true
                });
                // Sólo repintar los módulos si no es la primera vez que se carga la página
                if (this.__date !== undefined) {
                  this.triggerToModule('get:guide:server:data');
                }
            }
            this.__date = data;
        }
    });
});
