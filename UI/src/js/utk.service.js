(function () {
    'use strict';
    var utk = angular.module('utk.service', []);

    utk.factory('regEx', function () {
        return function(pattern, string) {
            pattern = pattern.toString();
            var result = [];
            var groupRX = /\(\<(.*?)\>\s(.*?)\)/;
            while (groupRX.test(pattern)) {
                var match = groupRX.exec(pattern);
                result.push({
                    name : match[1],
                    pattern : match[2],
                    value : null
                });
                pattern = pattern.replace(groupRX, '('+match[2]+')');
            }
             
            var finalMatch=(new RegExp(pattern)).exec(string);
            if(finalMatch) {
                for (var i = 0, len = result.length; i < len; i++) {
                    if(finalMatch[(i + 1)] !== false) {
                        result[i].value = finalMatch[(i + 1)];
                    }
                }
            }
            return result;
        };
    });
    
    utk.factory('parseDate', function(regEx) {
        return function(str, format) {
            //var pt = '(<day> [0-9]+)-(<month> [0-9]+)-(<year> [0-9]+)';
            var pt = format.replace('yyyy', '(<year> [0-9]+)');
            if(pt.indexOf('MM') >= 0)
                pt = pt.replace('MM', '(<month> [0-9]+)');
            else
                pt = pt.replace('M', '(<month> [0-9]+)');
                
            if(pt.indexOf('dd') >= 0)
                pt = pt.replace('dd', '(<day> [0-9]+)');
            else
                pt = pt.replace('d', '(<day> [0-9]+)');
            var m = regEx(pt, str);
            var obj = {};
            for(var i = 0, len = m.length; i < len; i++){
                var v = parseInt(m[i].value);
                if(isNaN(v))
                    return null;
                obj[m[i].name] = v;
            }
            
            return new Date(obj.year, obj.month - 1, obj.day);
        }
    });
    
    utk.factory('wait', function () {
        var html = '<div class="modal" role="dialog" tabindex="-1">' +
                        '<div class="modal-dialog modal-wait">' +
                            '<div class="modal-content wait-content" style="">' +
                                '<div class="modal-body wait-body">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        return {
            element: $(html),
            spinner: null,
            show: function(options) {
                var opt = {};
                angular.extend(opt, {
                    lines: 12,
                    color: '#767676',
                    speed: 1
                }, options);
                
                this.spinner = new Spinner(opt);
            
                this.spinner.spin(this.element.find('.modal-body').get(0));
                
                this.element.modal({
                    show: true,
                    keyboard: false,
                    backdrop: false
                });
            },
            hide: function() {
                this.element.modal('hide');
                this.spinner.stop();
            }
        }
    });

    utk.factory('msgbox', function ($q, $compile, $rootScope) {
        var html = '<div class="modal fade" role="dialog" tabindex="-1">' +
                        '<div class="modal-dialog">' +
                            '<div class="modal-content">' +
                                '<div class="modal-header">' +
                                    '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
                                    '<h4 class="modal-title"></h4>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                '</div>' +
                                '<div class="modal-footer">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        var defaultOpts = {
            title: 'Message',
            buttons: [],
            keyboard: true,
            backdrop: true
        };
        return {
            show: function (options) {
                var deferred = $q.defer();

                var opt = {};
                angular.extend(opt, defaultOpts, options);

                var element = $(html);
                element.find('.modal-title').eq(0).text(opt.title);
                element.find('.modal-body').eq(0).text(opt.message);

                var ft = '';
                for (var idx = 0; idx < opt.buttons.length; idx++) {
                    var btn = opt.buttons[idx];
                    ft += '<utk-button btn-text="' + btn.text + '"';
                    if (btn.type) ft += 'btn-type="' + btn.type + '"';
                    if (btn.icon) ft += 'btn-icon="' + btn.icon + '"';
                    if ('value' in btn) ft += 'ng-click="close(' + btn.value + ')"';
                    ft += '></utk-button>';
                }

                var mft = element.find('.modal-footer').eq(0);
                mft.append(ft);

                var scope = $rootScope.$new();
                $compile(element)(scope);

                scope.close = function (result) {
                    deferred.resolve(result);
                    element.modal('hide');
                };

                element.on('hide.bs.modal', function (e) {
                    deferred.resolve(null);
                });
                
                element.modal({
                    show: true,
                    keyboard: opt.keyboard,
                    backdrop: opt.backdrop
                });

                return deferred.promise;
            }
        }
    });

    utk.factory('dialog', function ($q, $compile, $http, $rootScope) {
        var html = '<div class="modal fade" role="dialog" tabindex="-1">' +
                        '<div class="modal-dialog">' +
                            '<div class="modal-content">' +
                                '<div class="modal-header">' +
                                    '<button type="button" class="close" data-dismiss="modal"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +
                                    '<h4 class="modal-title"></h4>' +
                                '</div>' +
                                '<div class="modal-body">' +
                                '</div>' +
                                '<div class="modal-footer">' +
                                '</div>' +
                            '</div>' +
                        '</div>' +
                    '</div>';
        var defaultOpts = {
            title: 'Dialog',
            buttons: [],
            keyboard: true,
            backdrop: true
        };

        return {
            show: function (options) {
                var deferred = $q.defer();

                var opt = {};
                angular.extend(opt, defaultOpts, options);

                var element = $(html);
                element.find('.modal-title').eq(0).text(opt.title);

                function compileAndDisplay(options) {
                    var bd = $(options.template);
                    var mbd = element.find('.modal-body').eq(0);
                    mbd.append(bd);

                    var ft = '';
                    for (var idx = 0; idx < options.buttons.length; idx++) {
                        var btn = options.buttons[idx];
                        ft += '<utk-button btn-text="' + btn.text + '"';
                        if (btn.type) ft += 'btn-type="' + btn.type + '"';
                        if (btn.icon) ft += 'btn-icon="' + btn.icon + '"';
                        if ('value' in btn) ft += 'ng-click="close(' + btn.value + ')"';
                        ft += '></utk-button>';
                    }

                    var mft = element.find('.modal-footer').eq(0);
                    mft.append(ft);
                    console.log(opt);
                    $compile(element)(opt.scope);
                    opt.scope.close = function (result) {
                        deferred.resolve(result);
                        element.modal('hide');
                    };
                    
                    if (opt.params) {
                        opt.scope.$params = opt.params;
                    }

                    element.on('hide.bs.modal', function (e) {
                        deferred.resolve(null);
                    });
                    
                    element.modal({
                        show: true,
                        keyboard: opt.keyboard,
                        backdrop: opt.backdrop
                    });
                }

                if (opt.template) {
                    compileAndDisplay(opt);
                } else if (opt.templateUrl) {
                    $http({
                        method: 'GET',
                        url: opt.templateUrl
                    }).then(function (result) {
                        opt.template = result.data;
                        compileAndDisplay(opt);
                    });
                }

                return deferred.promise;
            }
        }
    });
    
    utk.factory('toast', function ($timeout) {
        var template = 		
            '<div class="alert" role="alert">' +
                '<button type="button" class="alert-close"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +                        			
            '</div>';

        var container = (!$('.toast-container').length) ? 
            $('<div></div>').addClass('toast-container').appendTo('body') : $('.toast-container');
        
        function remove(alt) {
            alt.animate({opacity: '0'}, 600, function()
            {
                alt.animate({height: '0px'}, 200, function()
                {
                    alt.remove();
                });
            });
        };
        
        return {
            push: function (message, type, sticky) {
                var t = $(template);
                if(!type)
                    type = 'info';
                t.addClass('alert-' + type);
                t.append(message);
                container.append(t);

                t.find('button').eq(0).on('click', function() {					
                    remove(t);
                });
                
                if(!sticky) {
                    $timeout(function() {
                        remove(t);
                    }, 3000);
                }
            }
        }
    });
})();

