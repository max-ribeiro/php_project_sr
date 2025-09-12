'use strict';

(function (factory, jQuery, Handlebars) {

    if (typeof define === 'function' && define.amd) {
        define('jquery.modal', ['jquery', 'handlebars'], factory);
    } else if (typeof exports === 'object') {
        module.exports['jquery.modal'] = factory(require('jquery'));
    } else {
        factory(window.jQuery, window.Handlebars);
    }

}(function ($, Handlebars) {
    function stopevent(event) {
        event = event ? event : window.event;
        if (event.preventDefault) {
            event.preventDefault();
        }
        if (event.stopPropagation) {
            event.stopPropagation();
        } else {
            event.cancelBubble = true;
        }
        return false;
    }

    function dispatchEvent(object, event, data) {
        var type = 'Event';
        if (document.createEvent) {
            var elementevent = document.createEvent(type);
            elementevent.initEvent(event, true, true);
            if (data != undefined) {
                elementevent.data = data;
            }
            elementevent.currentClass = object;
            object.objEvent.dispatchEvent(elementevent);
        } else if (object.objEvent.fireEvent) {
            object.objEvent.fireEvent(event);
        }
    }

    function getUrlHome() {
        if (typeof define === 'function' && define.amd) {
            return '/';
        }
        if (window.initialState && window.initialState.urlHome) {
            return window.initialState.urlHome;
        }
        if (window.initialState && window.initialState.url_home) {
            return window.initialState.url_home;
        }
        if (window.request && window.request.url_home) {
            return window.request.url_home;
        }
        if (window.url_home) {
            return window.url_home;
        }
        if (window.initialAssinador && window.initialAssinador.urlHome) {
            return window.initialAssinador.urlHome;
        }
    }

    function getTemplateGallery(data) {
        if (!window.templateModalGallery) {
            $.ajax({
                url: getUrlHome() + 'assets/js/jquery.modal/gallery.html',
                async: false,
                success: function (html) {
                    window.templateModalGallery = html;
                },
            });
        }
        var template = Handlebars.compile(window.templateModalGallery);
        template = $(template(data));
        return template;
    }

    function getTemplate(data) {
        if (!window.templateModal) {
            $.ajax({
                url: getUrlHome() + 'assets/js/jquery.modal/template.html',
                async: false,
                success: function (html) {
                    window.templateModal = html;
                },
            });
        }
        if (data.isGallery) {
            var active = 0;
            for (var i in data.content) {
                if (data.content[i].active) {
                    active = i;
                    break;
                }
            }
            data.content = getTemplateGallery({
                id: data.idGallery ? data.idGallery : 'gallery',
                gallery: data.content
            });
            if (active) {
                setTimeout(function () {
                    data.content.find('.carousel-indicators li:eq(' + active + ')').trigger('click');
                }, 10);
            }
        } else if (data.iframe || /^\/\/|^[\w-]*\:\/\//i.test(data.content)) {
            var iframe = $('<iframe width="100%" height="99%" frameborder="0" allowfullscreen>');
            iframe.attr('src', data.content);
            var timestamp = new Date().getTime();
            iframe.attr('id', timestamp);
            iframe[0].onload = function (event) {
                $(event.target).next().remove();
                $(event.target.contentDocument).find('[data-dismiss="modal"]').click(function () {
                    $.modal.get('#' + timestamp).close();
                });
            };
            if (data.loadingText !== false) {
                iframe = iframe.add('<h3 style="position: absolute; top: 50%; left: 50%; margin: -13px 0 0 -75px;">Carregando...</h3>');
            }
            data.content = iframe;
        }
        if (data.btnClose || data.btnAction || data.footerContent) {
            data.showFooter = true;
        }
        var template = Handlebars.compile(window.templateModal);
        template = $(template(data));
        template.find('[content]').html(data.content);
        if (data.footerContent) {
            template.find('[footerContent]').html(data.footerContent);
        }
        return template;
    }

    function closeEsc(event) {
        if (event.keyCode == 27 || event.which == 27 || event.key == '"Escape"') {
            Modal.constructor.list[0].close();
            stopevent(event);
        }
    }

    function setHeight(element, space, size) {
        size = size || window.innerHeight;
        space = space + element.innerHeight() - element.height();
        element.height(calc(size, space));
    }

    function setWidth(element, space, size) {
        size = size || window.innerWidth;
        space = space + element.innerWidth() - element.width();
        element.width(calc(size, space));
    }

    function calc(size, space) {
        if (space) {
            return (size - space) + 'px';
        } else {
            return size + 'px';
        }
    }

    function resize(event) {
        $('.modal').each(function () {
            var height = window.innerHeight - $(this).find('.modal-header').outerHeight() - $(this).find('.modal-footer').outerHeight() - 10;
            if ($(this).find('.modal-dialog').attr('fullsize')
                || $(this).find('.modal-dialog').attr('fullsizeWidth')) {
                var space = parseInt($(this).find('.modal-dialog').attr('space'));
                $(this).find('.modal-dialog').css('margin', 0);
                $(this).find('.modal-dialog').css('padding', 0);
                $(this).find('.modal-dialog').css('width', 'auto');
                $(this).find('.modal-content').css('margin', (space / 2) + 'px');
                $(this).find('.modal-content').css('width', 'auto');
                if ($(this).find('.modal-dialog').attr('fullsize')) {
                    setHeight($(this).find('[content]'), space, height);
                } else {
                    $(this).find('[content]').css('max-height', height - space);
                }
            } else {
                $(this).find('[content]').css('max-height', height - 60);
            }
            $(this).find('[content]').css('overflow', 'auto');
        });
    }

    function Modal(content, params) {
        var self = this;
        params = $.extend({}, $.modal.paramsDefault, {
            content: content,
        }, params);

        var element = getTemplate(params);
        $('body').append(element);
        element.find('.modal').show();
        element.find('.modal').animate({
            opacity: 1
        }, 600);
        element.find('.modal').addClass('in');

        element.click(function (event) {
            if ($(event.target).hasClass('modal')) {
                if (params.closeClickOut) {
                    self.close();
                }
                stopevent(event);
            } else if (
                $(event.target).attr('action') == 'close' ||
                $(event.target).attr('data-dismiss') == 'modal'
            ) {
                self.close();
            } else if ($(event.target).attr('action') == 'go') {
                dispatchEvent(self, 'go');
            }
        });
        if (params.fullsizeWidth) {
            element.find('.modal-dialog').attr('fullsizeWidth', true);
        } else if (params.fullsize) {
            element.find('.modal-dialog').attr('fullsize', true);
        }
        if (params.space) {
            element.find('.modal-dialog').attr('space', params.space);
        }
        if (params.size) {
            element.find('.modal-dialog').addClass(params.size);
        }
        if (params.className) {
            element.find('.modal').addClass(params.className);
        }
        $('html, body').addClass('modal-open');
        self.element = element;
        self.objEvent = typeof (XMLHttpRequest) != 'undefined' ? new XMLHttpRequest() : window;

        $(window).off('resize', resize);
        $(window).on('resize', resize);

        $(window).off('keydown', closeEsc);
        $(window).on('keydown', closeEsc);

        resize();
    }

    Modal.prototype.trigger = function (event, data) {
        dispatchEvent(this, event, data);
    };

    Modal.prototype.close = function () {
        var element = this.element;
        var self = this;
        $('html, body').removeClass('modal-open');
        element.find('.modal').animate({
            opacity: 0
        }, 300, function () {
            element.remove();
            for (var i in Modal.constructor.list) {
                if (self == Modal.constructor.list[i]) {
                    delete Modal.constructor.list[i];
                }
            }
            Modal.constructor.list.sort();
            Modal.constructor.list.pop();
            if (!Modal.constructor.list.length) {
                $(window).off('resize', resize);
                $(window).off('keydown', closeEsc);
            }
            dispatchEvent(self, 'close');
        });
    };
    Modal.prototype.on = function (event, callback) {
        if (!event) return;
        if (!callback) return;
        var object = this.objEvent;
        var events = event.split(' ');
        for (var e in events) {
            if (object.addEventListener) {
                object.removeEventListener(events[e], callback, false);
                object.addEventListener(events[e], callback, false);
            } else if (object.attachEvent) {
                object.detachEvent(events[e], callback);
                object.attachEvent(events[e], callback);
            }
        }
    }
    Modal.prototype.off = function (event, callback) {
        if (!event) return;
        var object = this.objEvent;
        var events = event.split(' ');
        for (var e in events) {
            if (object.addEventListener) {
                object.removeEventListener(events[e], callback, false);
            } else if (object.attachEvent) {
                object.attachEvent(events[e], callback);
            }
        }
    }

    Handlebars.registerHelper('SafeString', function (value) {
        return new Handlebars.SafeString(value);
    });

    $.modal = function (content, data) {
        var modal = new Modal(content, data);
        if (!Modal.constructor.list) {
            Modal.constructor.list = Array();
        }
        Modal.constructor.list.push(modal);
        Modal.constructor.list.reverse();
        return modal;
    };
    $.modal.get = function (position) {
        if (!Modal.constructor.list) return null;
        if (Modal.constructor.list && Modal.constructor.list.length == 0) return null;

        var i;
        if (position != undefined && typeof (position) == 'number') {
            return Modal.constructor.list[position];
        } else if (position != undefined && typeof (position) == 'string') {
            for (i in Modal.constructor.list) {
                if (Modal.constructor.list[i].element.filter(position)[0]
                    || Modal.constructor.list[i].element.find(position)[0]) {
                    return Modal.constructor.list[i];
                }
            }
        } else if (position != undefined && typeof (position) == 'object') {
            for (i in Modal.constructor.list) {
                if (Modal.constructor.list[i].element[0] == position) {
                    return Modal.constructor.list[i];
                }
            }
        } else if (Modal.constructor.list.length == 1) {
            return Modal.constructor.list[0];
        } else {
            return Modal.constructor.list;
        }
    };
    $.modal.closeAll = function () {
        for (var i in Modal.constructor.list) {
            Modal.constructor.list[i].close();
        }
    };
    $.modal.paramsDefault = {
        zIndex: 1000,
        title: '',
        btnClose: 'ok',
        btnAction: '',
        fullsize: false,
        fullsizeWidth: false,
        space: 0,
        closeClickOut: true,
        size: null,
        footerContent: null
    };

    window.addEventListener('message', function (event) {
        if (event.data.action == 'close') {
            if (event.data.queryString) {
                $.modal.get(event.data.queryString).close();
            } else {
                $.modal.get(0).close();
            }
        } else if (event.data.action == 'closeAll') {
            $.modal.closeAll();
        } else if (event.data.action == 'eventCallback') {
            if (event.data.queryString) {
                dispatchEvent($.modal.get(event.data.queryString), 'callback', event.data.data);
            }
        }
    });
}));