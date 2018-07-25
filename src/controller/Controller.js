define([
    'agile-app',
    '../commands/GetProgramCommand',
    '../commands/ProgramSchedulerCommand',
    '../commands/GetLocalStationCommand',
    '../commands/GetServerDataCommand',
    '../commands/SetReloadTimerCommand',
    '../commands/SetCallUrlTimerCommand',
    '../commands/GetLastModificationDateCommand',
    '../commands/GetGuideDataCommand'

], function(Agile, GetProgramCommand, ProgramSchedulerCommand, GetLocalStationCommand, GetServerDataCommand, SetReloadTimer, SetCallUrlTimerCommand, GetLastModificationDateCommand, GetGuideDataCommand) {
    'use strict';

	return Agile.Controller.extend({

        moduleEvents: {
            'retrieve:program'              : 'getProgram',
            'init:scheduler:program'        : 'initSchedulerProgram',
            'get:local:station'             : 'getLocalStation',
            'get:server:data'               : 'getServerData',
            'set:reload:timer'              : 'SetReload',
            'set:call:url:timer'            : 'SetCallUrlTimer',
            'get:last:server:modification'  : 'GetLastModificationDate',
            'get:guide:server:data'         : 'GetGuideDataCommand'

        },

        commands: {
            'getProgram'                : GetProgramCommand,
            'initSchedulerProgram'      : ProgramSchedulerCommand,
            'getLocalStation'           : GetLocalStationCommand,
            'getServerData'             : GetServerDataCommand,
            'SetReload'                 : SetReloadTimer,
            'SetCallUrlTimer'           : SetCallUrlTimerCommand,
            'GetLastModificationDate'   : GetLastModificationDateCommand,
            'GetGuideDataCommand'       : GetGuideDataCommand
        }

    });
});
