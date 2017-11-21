define(['agile-app','config'], function (Agile,config) {

  return Agile.View.extend({

    //<th:block th:utext="${@esiHelper.generateInclude('/component/cmp-cg-4-programas-portada-c3.shtml?#program={0}', {'__${model.taxonomy.uid}__'})}" />

    bindedTo: '[data-selector="cmp-cg-4-program-manual-c3-view"]',


    moduleEvents: {
      'update:programcontentgroup:data': '_onProgContentGroupDataUpdated'
    },

    onBinding: function () {
      this._stream = this.$el[0].dataset.direct;
    },

    _onProgContentGroupDataUpdated: function (data) {
      if (data.stream !== this._stream) {
        return;
      }

      $.ajax({
        type: 'GET',
        url: config.cg4programfrontpagec3,
        data: {
          program: data.taxonomy
        },
        dataType: 'html',
        success: function (html) {
          if (!~html.indexOf('item no encontrado')) {
            $('[data-selector="cmp-cg-4-program-manual-c3-view"]').html(html).show();
            // Create the event
            var event = new CustomEvent("setTargetBlankInStreamingPage", {});
            // Dispatch/Trigger/Fire the event
            document.dispatchEvent(event);
          } else {
            $('[data-selector="cmp-cg-4-program-manual-c3-view"]').hide();
          }
        },
        error: function () {
        }
      });
    }
  });
});
