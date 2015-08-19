(function () {
    'use strict';
    var utk = angular.module('utk.directive', ['utk.service']);
    
    var g_id = 0;
    function makeId(prefix) {
        g_id++;
        return prefix + '_gid_' + g_id;
    };
    function initAttr(attrs, name, initVal) {
        if(!attrs[name]) {
            if(arguments.length == 2) {
                attrs[name] = 'primary';
            } else {
                attrs[name] = initVal;
            }
        }
    };
    
    utk.directive('utkLabel', function() {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                text: '@lblText',
                type: '@lblType'
            },
            template: '<span class="label label-{{type}}">{{text}}</span>',
            compile: function (element, attrs) {
                initAttr(attrs, 'lblType');
                return function (scope, element) {
                }
            }
        }
    });
    
    utk.directive('utkBadge', function() {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                text: '@bdgText'                
            },
            template: '<span class="badge">{{text}}</span>'
        }
    });

    utk.directive('utkHeader', function ($location) {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                text: '@hdrText',
                img: '@hdrImg',
                data: '=menuData',
                content: '@hdrContent'
            },
            template: '<div class="navbar-wrapper">' +
                            '<div class="navbar navbar-inverse navbar-static-top" role="navigation">' +
                                '<div class="navbar-header">' +
                                    '<button type="button" class="navbar-toggle" data-toggle="collapse" data-target=".navbar-collapse">' +									
                                        '<span class="icon-bar"></span>' +
                                        '<span class="icon-bar"></span>' +
                                        '<span class="icon-bar"></span>' +
                                    '</button>' +
                                    '<span ng-if="content==\'true\'" class="navbar-toggle pull-right" ng-transclude></span>' +
                                    '<a class="navbar-brand utk-brand">{{text}}</a>' +
                                '</div>' +
                                '<div class="navbar-collapse collapse">' +
                                    '<ul class="nav navbar-nav pull-right"><li><a ng-transclude></a></li></ul>' +
                                    '<ul class="nav navbar-nav">' +
                                        '<li ng-repeat="item in data" ng-class="{active: $index==0, dropdown: item.dropdown}">' +
                                            '<a ng-if="!item.dropdown" href="{{item.path}}" ng-click="handle(item)">{{item.name}}</a>' +
                                            '<a ng-if="item.dropdown" class="dropdown-toggle" data-toggle="dropdown">{{item.name}}<span class="caret"></span></a>' +
                                            '<ul class="dropdown-menu" role="menu">' +
                                                '<li ng-repeat="sub in item.dropdown" ng-class="{divider: sub.divider}">' +
                                                    '<a href="{{sub.path}}" ng-if="!sub.divider" ng-click="handle(item)" utk-bind-html-ex="sub.name"></a>' +
                                                '</li>' +
                                            '</ul>' +
                                        '</li>' +
                                    '</ul>' +
                                '</div>' +
                            '</div>' +
                        '</div>',
            controller: function ($scope, $element) {
                var requireAction = true;
                $scope.handle = function (item) {
                    var list = $('ul.nav>li', $element)
                    for (var i = 0; i < list.length; i++) {
                        var li = list.eq(i);

                        var a = li.find('a').eq(0);
                        if (item.name == a.text()) {
                            li.addClass('active');
                        } else {
                            li.removeClass('active');
                        }
                    }
                    requireAction = false;
                };

                function search1stLvlName(data, target) {
                    for (var i = 0; i < data.length; i++) {
                        if (data[i].path && data[i].path.substr(2) == target) {
                            return data[i].name;
                        } else {
                            if (data[i].dropdown) {
                                var list = data[i].dropdown;
                                for (var j = 0; j < list.length; j++) {
                                    if (list[j].path && list[j].path.substr(2) == target)
                                        return data[i].name;
                                }
                            }
                        }
                    }
                    console.warn("menu not found.");
                    return target;
                };

                $scope.$on('$routeChangeSuccess', function (x) {
                    if (!requireAction) {
                        requireAction = true;
                        return;
                    }

                    var key = $location.path().substr(1);
                    var mn1stLvl = search1stLvlName($scope.data, key);
                    var list1stLvl = $('.nav>li', $element);
                    list1stLvl.each(function (i, e) {
                        if ($(e).find('a').eq(0).text() == mn1stLvl) {
                            $(e).addClass('active');
                        } else {
                            $(e).removeClass('active');
                        }
                    });
                });
            },

            link: function (scope, element, attrs) {
                var b = $('a.utk-brand', element);
                b.css('backgroundImage', "url('" + scope.img + "')");
            }
        };
    });

    utk.directive('utkTabSet', function () {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                tabChanged: '&'
            },
            template:
                '<div class="tabbable">' +
                  '<ul class="nav nav-tabs">' +
                    '<li ng-repeat="tab in tabs" ng-class="{active:tab.selected}">' +
                      '<a ng-click="select(tab)">{{tab.tabHeader}}</a>' +
                    '</li>' +
                  '</ul>' +
                  '<div class="tab-content" ng-transclude></div>' +
                '</div>',

            controller: function ($scope) {
                var tabs = $scope.tabs = [];

                $scope.select = function (tab) {
                    angular.forEach(tabs, function (tab) {
                        tab.selected = false;
                    });
                    tab.selected = true;
                    if (tabs.length > 1)
                        $scope.tabChanged && $scope.tabChanged({ tab: tab });
                }

                this.addTab = function (tab) {
                    if (tabs.length == 0) $scope.select(tab);
                    tabs.push(tab);
                }
            }
        };
    });

    utk.directive('utkTab', function () {
        return {
            require: '^utkTabSet',
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                tabHeader: '@'
            },
            template:
                '<div class="tab-pane" ng-class="{active: selected}" ng-transclude>' +
                '</div>',
            link: function (scope, element, attrs, tabsCtrl) {
                tabsCtrl.addTab(scope);
            },
        };
    });
    
    utk.directive('utkBindHtml', function($compile) {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                return function (scope, element) {
                    scope.$watch(attrs.utkBindHtml, function(x) {
                        var v = $.parseHTML(x);
                        element.html(v);
                    });
                }
            }
        };
    });
    
    utk.directive('utkBindHtmlEx', function($compile) {
        return {
            restrict: 'A',
            compile: function (element, attrs) {
                return function (scope, element) {
                    scope.$watch(attrs.utkBindHtmlEx, function(x) {
                        var v = $compile($.parseHTML(x))(scope);
                        element.html(v);
                    });
                }
            }
        };
    });

    utk.directive('utkButton', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                text: '@btnText',
                type: '@btnType',
                icon: '@btnIcon',
                size: '@btnSize',
                disabled: '@btnDisabled'
            },
            template: '<a class="btn btn-{{type}}" ng-class="{\'btn-lg\': size==\'large\', \'btn-sm\': size==\'small\', \'btn-xs\': size==\'xsmall\'}" ng-disabled="disabled===true||disabled==\'true\'">' +
                        '<span ng-if="icon" class="glyphicon glyphicon-{{icon}}" style="margin-right: 4px;"></span>' +
                        '{{text}}</a>',
            compile: function (element, attrs) {
                initAttr(attrs, 'btnType');
                return function (scope, element) {
                }
            }
        };
    });

    utk.directive('utkCheckbox', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                id: '@chkId',
                type: '@chkType',
                text: '@chkText',
                changed: '&chkChanged',
                disabled: '@chkDisabled'
            },
            require: '?ngModel',
            template: '<div class="checkbox checkbox-{{type}}">' +
                        '<input type="checkbox" id="{{id}}" ng-disabled="disabled===true||disabled==\'true\'">' +
                        '<label for="{{id}}">{{text}}</label>' +
                      '</div>',
            compile: function (element, attrs) {
                initAttr(attrs, 'chkType');
                initAttr(attrs, 'chkId', makeId('chk'));
                
                return function (scope, element, attrs, ngCtrl) {
                    $('label', element).on('click', function (evt) {
                        if (scope.disabled === true || scope.disabled == 'true')
                            return;

                        var input = element.find('input').eq(0);
                        var cur = !input.prop('checked');

                        ngCtrl && scope.$apply(ngCtrl.$setViewValue(cur));
                        scope.changed && scope.$apply(scope.changed({ 'value': cur }));
                    });

                    if (ngCtrl) {
                        ngCtrl.$render = function () {
                            var chk = element.find('input').eq(0);
                            if (chk) {
                                chk.prop('checked', ngCtrl.$modelValue);
                            }
                        }
                    }
                }
            }
        }
    });

    utk.directive('utkRadiogroup', function ($timeout) {
        return {
            restrict: 'AE',
            scope: {
                groupName: '@grpName',
                groupType: '@grpType',
                rbChanged: '&'
            },
            require: '?ngModel',
            transclude: true,
            template: '<div ng-transclude></div>',
            controller: function ($scope, $element) {
                this.getGroupName = function () {
                    return $scope.groupName;
                };

                this.getGroupType = function () {
                    return $scope.groupType;
                };
                
                this.applyChanged = function (value) {
                    $scope.rbChanged && $scope.$apply($scope.rbChanged({value: value}));
                };

                $scope.choices = [];
                $scope.elements = [];
                this.addChoice = function (choice, elem) {
                    $scope.choices.push(choice);
                    $scope.elements.push(elem);
                }
            },

            compile: function (element, attrs) {
                initAttr(attrs, 'grpType');
                initAttr(attrs, 'grpName', makeId('rgn'));
                
                return function (scope, element, attrs, ngCtrl) {
                    if (!ngCtrl)
                        return;

                    ngCtrl.$render = function () {
                        for (var i = 0; i < scope.choices.length; i++) {
                            var c = scope.choices[i];
                            scope.elements[i].find('input').eq(0).prop('checked', c.value == ngCtrl.$modelValue);
                        }
                    }
                    
                    //Note:First time render
                    $timeout(ngCtrl.$render, 0);
                    
                    scope.$watch('groupType', function() {
                        angular.forEach(scope.choices, function(c){
                            c.type = scope.groupType;
                        });
                    });
                }
            }
        }
    });

    utk.directive('utkRadiobutton', function () {
        return {
            restrict: 'AE',
            replace: true,
            require: ['^utkRadiogroup', '?^ngModel'],
            scope: {
                id: '@rbId',
                text: '@rbText',
                value: '@rbValue',
                disabled: '@rbDisabled'
            },
            template: '<div class="radio radio-{{type}}">' +
                        '<input type="radio" id="{{id}}" name="{{name}}" ng-disabled="disabled===true||disabled==\'true\'">' +
                        '<label for="{{id}}">{{text}}</label>' +
                      '</div>',
            compile: function (element, attrs) {
                initAttr(attrs, 'rbId', makeId('rb'));
                return function (scope, element, attrs, ctrls) {
                    var grpCtrl = ctrls[0];
                    var ngCtrl = ctrls[1];
                    scope.type = grpCtrl.getGroupType();
                    scope.name = grpCtrl.getGroupName();

                    grpCtrl.addChoice(scope, element);

                    $('label', element).on('click', function () {
                        if (scope.disabled === true || scope.disabled == 'true')
                            return;

                        ngCtrl && ngCtrl.$setViewValue(scope.value);
                        grpCtrl.applyChanged(scope.value);
                    });
                }
            }
        };
    });    

    utk.directive('utkPagination', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                totalRecords: '@pgTotalRecords',
                numberPerPage: '@pgNumberPerPage',
                pageChanged: '&pgChanged'
            },
            template: '<div class="form-inline">' +
                            '<ul class="pagination input-group">' +
                                '<li ng-class="{disabled: disableBack}"><a class="pagination-button" ng-click="goFirst()">&laquo;</a></li>' +
                                '<li ng-class="{disabled: disableBack}"><a class="pagination-button" ng-click="goPrev()">&lsaquo;</a></li>' +
                                '<li ng-repeat="d in range" ng-show="d <= totalPages" ng-class="{active: d== currentPage}"><a class="pagination-button" ng-click="goPage(d)">{{d}}</a></li>' +
                                '<li ng-class="{disabled: disableNext}"><a class="pagination-button" ng-click="goNext()">&rsaquo;</a></li>' +
                                '<li ng-class="{disabled: disableNext}"><a class="pagination-button" ng-click="goLast()">&raquo;</a></li>' +
                            '</ul>' +
                            '<div class="input-group">&nbsp;Total <span class="pagination-indicator">{{totalRecords}}</span> item(s), <span class="pagination-indicator">{{totalPages}}</span> page(s)</div>' +
                            '<div class="input-group"><input type="text" class="pagination-input"/></div>' +
                            '<a class="btn btn-primary btn-sm" ng-click="goInput()">Go</a>' +
                        '</div>',
            controller: function ($scope, $element) {
                var inp = $element.find("input[type=text]").eq(0);
                inp.val(1);
                $scope.goFirst = function () {
                    if ($scope.disableBack) return;

                    if ($scope.totalPages > 5) {
                        $scope.range = [1, 2, 3, 4, 5];
                    }
                    $scope.currentPage = 1;
                    inp.val($scope.currentPage);
                    $scope.pageChanged && $scope.pageChanged({ page: $scope.currentPage });
                };

                $scope.goLast = function () {
                    if ($scope.disableNext) return;

                    if ($scope.totalPages > 5) {
                        $scope.range = [$scope.totalPages - 4, $scope.totalPages - 3, $scope.totalPages - 2, $scope.totalPages - 1, $scope.totalPages];
                    }
                    $scope.currentPage = $scope.totalPages;
                    inp.val($scope.currentPage);
                    $scope.pageChanged && $scope.pageChanged({ page: $scope.currentPage });
                };

                $scope.goPrev = function () {
                    if ($scope.disableBack) return;

                    if ($scope.totalPages > 5) {
                        if ($scope.range[0] > 1 && $scope.currentPage < $scope.totalPages - 1) {
                            for (var i = 0; i < 5; i++)
                                $scope.range[i]--;
                        }
                    }
                    $scope.currentPage--;
                    inp.val($scope.currentPage);
                    $scope.pageChanged && $scope.pageChanged({ page: $scope.currentPage });
                };

                $scope.goNext = function () {
                    if ($scope.disableNext) return;

                    if ($scope.totalPages > 5) {
                        if ($scope.currentPage > 2 && $scope.range[4] < $scope.totalPages) {
                            for (var i = 0; i < 5; i++)
                                $scope.range[i]++;
                        }
                    }
                    $scope.currentPage++;
                    inp.val($scope.currentPage);
                    $scope.pageChanged && $scope.pageChanged({ page: $scope.currentPage });
                };

                $scope.goPage = function (p) {
                    if (p == $scope.currentPage) return;
                    $scope.currentPage = p;
                    inp.val($scope.currentPage);
                    $scope.pageChanged && $scope.pageChanged({ page: $scope.currentPage });
                };

                $scope.goInput = function () {
                    var x = parseInt(inp.val());
                    if (x == $scope.currentPage || isNaN(x)) return;
                    if (x < 1)
                        x = 1;
                    if (x > $scope.totalPages)
                        x = $scope.totalPages;
                    $scope.currentPage = x;
                    inp.val(x);
                    $scope.pageChanged && $scope.pageChanged({ page: $scope.currentPage });
                }
            },
            compile: function (element, attrs) {
                initAttr(attrs, 'pgNumberPerPage', '10');
                return function (scope, element, attrs) {
                    scope.range = [1, 2, 3, 4, 5];
                    scope.currentPage = 1;

                    function recalc() {
                        scope.totalPages = Math.ceil(scope.totalRecords / scope.numberPerPage);
                        if (scope.totalPages == 0)
                            scope.totalPages = 1;

                        scope.disableBack = (scope.currentPage == 1);
                        scope.disableNext = (scope.currentPage == scope.totalPages);

                        if (scope.totalPages > 5) {
                            if (scope.currentPage > 2 && scope.currentPage < scope.totalPages - 1) {
                                for (var i = 0; i < 5; i++) {
                                    scope.range[i] = scope.currentPage + i - 2;
                                }
                            } else if (scope.currentPage <= 2) {
                                scope.range = [1, 2, 3, 4, 5];
                            } else if (scope.currentPage >= scope.totalPages - 1) {
                                scope.range = [scope.totalPages - 4, scope.totalPages - 3, scope.totalPages - 2, scope.totalPages - 1, scope.totalPages];
                            }
                        } else {
                            scope.range = [1, 2, 3, 4, 5];
                            if(scope.currentPage > scope.totalPages) {
                                scope.currentPage = scope.totalPages;
                                scope.pageChanged && scope.pageChanged({page: scope.currentPage});
                                var inp = element.find("input[type=text]").eq(0);
                                inp.val(scope.currentPage);
                            }
                        }
                    }

                    scope.$watchGroup(['totalRecords', 'numberPerPage', 'currentPage'], recalc);
                    scope.$watch('range', recalc, true);
                }
            }
        }
    });

    utk.directive('utkDropdown', function ($timeout) {
        function setToValue(element, scope, target) {
            var txt = element.find('#' + scope.id).eq(0).find("span").eq(1);
            for (var i = 0; i < scope.items.length; i++) {
                if (scope.items[i].value == target) {
                    txt.text(scope.items[i].name);
                    break;
                }
            }
        };
        var selected = false;
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                items: '=dpItems',
                id: '@dpId',
                type: '@dpType',
                size: '@dpSize',
                width: '@dpWidth',
                disabled: '@dpDisabled',
                changed: '&dpChanged'
            },
            require: '?ngModel',
            template:
                '<div class="dropdown">' +
                  '<button id="{{id}}" ng-disabled="disabled===true||disabled==\'true\'" ng-class="{\'btn-lg\': size==\'large\', \'btn-sm\': size==\'small\', \'btn-xs\': size==\'xsmall\'}" ng-style="{width: width}" ng-click="drop()" class="btn btn-{{type}} dropdown-toggle" type="button" data-toggle="dropdown">' +
                    '<span class="caret pull-right" style="margin-top: 8px"></span>' +
                    '<span>' +
                        '{{text}}' +
                    '</span>' +                    
                  '</button>' +
                  '<ul class="dropdown-menu" role="menu" aria-labelledby="{{id}}">' +
                    '<li role="presentation" ng-repeat="item in items"><a role="menuitem" ng-click="select(item.value)">{{item.name}}</a></li>' +
                  '</ul>' +
                '</div>',
            controller: function ($scope, $element) {
                $scope.select = function (v) {
                    selected = true;
                    setToValue($element, $scope, v);
                    $scope.val = v;
                }

                $scope.drop = function () {
                    var ul = $element.find('ul').eq(0);
                    var btn = $element.find('#' + $scope.id).eq(0);
                    if (ul.width() < btn.width())
                        ul.width(btn.width() + 24);
                }
            },
            compile: function (element, attrs) {
                initAttr(attrs, 'dpId', makeId('dp'));
                initAttr(attrs, 'dpType', 'none');
                return function (scope, element, attrs, ngCtrl) {
                    scope.text = "Select a value...";

                    element.on('hidden.bs.dropdown', function () {
                        var v = selected ? scope.val : (ngCtrl.$modelValue);
                        selected = false;
                        ngCtrl && scope.$apply(ngCtrl.$setViewValue(v));
                        scope.changed && scope.$apply(scope.changed({ 'value': v }));
                    });

                    if (ngCtrl) {
                        ngCtrl.$render = function () {
                            setToValue(element, scope, ngCtrl.$modelValue);
                        }
                    }
                    
                    //Note:First time set
                    $timeout(function() {
                        setToValue(element, scope, ngCtrl.$modelValue);
                    }, 0);
                }
            }
        };
    });

    utk.directive('utkAlert', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                type: '@altType',
                closable: '@altClosable'
            },
            template: '<div class="alert alert-{{type}}" role="alert">' +
                        '<button ng-if="closable==\'true\'" type="button" class="alert-close" data-dismiss="alert"><span aria-hidden="true">&times;</span><span class="sr-only">Close</span></button>' +                        
                        '<div ng-transclude></div>' +
                      '</div>',
            compile: function (element, attrs) {
                initAttr(attrs, 'altType', 'danger');
                initAttr(attrs, 'altClosable', 'false');

                return function (scope, element, attrs) {
                }
            }
        }
    });

    utk.directive('utkProgress', function () {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                type: '@pgrType',
                progress: '@pgrProgress',
                label: '@pgrLabel'
            },
            template: '<div class="progress">' +
                        '<div ng-if="label!=\'true\'" class="progress-bar progress-bar-{{type}}" role="progressbar" aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" ng-style="{width: progress + \'%\'};">' +                            
                        '</div>' +
                        '<div ng-if="label==\'true\'" class="progress-bar progress-bar-{{type}}" role="progressbar" aria-valuenow="progress" aria-valuemin="0" aria-valuemax="100" ng-style="{width: progress + \'%\'};">' +
                            '{{progress}}%' +
                        '</div>' +
                       '</div>',
            compile: function (element, attrs) {
                initAttr(attrs, 'pgrType');
                return function (scope, element, attrs) {
                }
            }
        }
    });

    utk.directive('utkList', function ($compile) {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=lstData',
                itemClick: '&lstItemClick'
            },
            template: 
                    '<div class="list-group">' +
                        '<a ng-click="click(item)" ng-repeat="item in data" class="list-group-item list-group-item-default" ng-transclude>' +
                        '</a>' +
                    '</div>',
            controller: function ($scope, $element) {
                var idx = 0;
                this.add = function(scope) {
                    scope.item = $scope.data[idx];
                    idx++;
                }
                
                $scope.click = function(item) {
                    $scope.itemClick && $scope.itemClick({value: item});
                }
            },
            
            compile: function (element, attrs) {
                return function (scope, element, attrs) {
                }
            }
        }
    });
    
    utk.directive('utkListItem', function ($compile) {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            require: '^utkList',
            template: '<div ng-transclude></div>',
            link: function (scope, element, attrs, listCtrl) {
                listCtrl.add(scope);
            }
        }
    });
    
    utk.directive('utkPanel', function () {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            scope: {
                type: '@pnlType'
            },
            template: '<div ng-transclude class="panel panel-{{type}}"></div>',
            controller: function($scope, $element) {
            },
            compile: function (element, attrs) {
                initAttr(attrs, 'pnlType', 'default');
                return function (scope, element, attrs) {
                }
            }
        }
    });
    
    utk.directive('utkPanelHeader', function () {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            require: '^utkPanel',
            template: '<div class="panel-heading">' +
                        '<h3 ng-transclude class="panel-title">' +
                        '</h3>' +
                    '</div>',
            link: function (scope, element, attrs) {
            }
        }
    });
    
    utk.directive('utkPanelBody', function () {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            require: '^utkPanel',
            template: '<div ng-transclude class="panel-body"></div>',
            link: function (scope, element, attrs) {
            }
        }
    });
    
    utk.directive('utkPanelFooter', function () {
        return {
            restrict: 'AE',
            transclude: true,
            replace: true,
            require: '^utkPanel',
            template: '<div ng-transclude class="panel-footer"></div>',
            link: function (scope, element, attrs) {
            }
        }
    });
    
    utk.directive('utkTable', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                data: '=tblData',
                striped: '@tblStriped',
                bordered: '@tblBordered',
                condensed: '@tblCondensed',
                hover: '@tblHover'
            },
            template:   '<table class="table" ng-class="{\'table-hover\': hover == \'true\', \'table-striped\': striped == \'true\', \'table-bordered\': bordered == \'true\', \'table-condensed\': condensed == \'true\'}">' +
                            '<thead>' +
                                '<tr>' +
                                    '<th ng-repeat="h in head">{{h}}</th>' +
                                '</tr>' +
                            '</thead>' +
                            '<tbody>' +
                                '<tr ng-repeat="line in body">' +
                                    '<td ng-repeat="cell in line" ng-transclude></td>' +
                                '</tr>' +
                            '</tbody>' +
                        '</table>',
            controller: function($scope) {
                var i = 1, j = 0;
                var rows = $scope.data.length - 1;
                var cols = $scope.data[0].length;
                
                this.addCell = function (cellScope) {
                    cellScope.item = $scope.data[i][j];
                    j++;
                    if(j >= cols) {
                        j = 0;
                        i++;
                    }
                }
            },
            compile: function (element, attrs) {
                return function (scope, element, attrs) {
                    scope.head = scope.data[0];
                    scope.body = scope.data.slice(1);
                }
            }
        }
    });
    
    utk.directive('utkTableCell', function () {
        return {
            restrict: 'AE',
            replace: true,
            require: '^utkTable',
            transclude: true,
            template: '<span ng-transclude></span>',
            link: function(scope, element, attrs, tbCtrl) {
                tbCtrl.addCell(scope);
            }
        }
    });
    
    utk.directive('utkTooltip', function () {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                text: '@tipText',
                placement: '@tipPlacement',
                trigger: '@tipTrigger',
                container: '@tipContainer'
            },
            template: '<span ng-transclude></span>',
            compile: function(element, attrs) {
                initAttr(attrs, 'tipTrigger', 'hover');
                initAttr(attrs, 'tipContainer', false);
                initAttr(attrs, 'tipPlacement', 'auto');
                return function(scope, element, attrs) {
                    function make() {
                        $(element).tooltip('destroy');
                        $(element).tooltip({
                            title: scope.text,
                            trigger: scope.trigger,
                            placement: scope.placement,
                            container: (scope.container == 'false' || scope.container == false) ? false : scope.container
                        });
                    }
                    
                    scope.$watch('text', make);
                    scope.$watch('placement', make);
                    scope.$watch('trigger', make);
                }
            }
        }
    });
    
    utk.directive('utkAccordion', function() {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                id: "@acdId",
                type: "@acdType",
                shown: "&acdShown"
            },
            template: '<div class="panel-group" id="{{id}}" ng-transclude></div>',
            controller: function($scope) {
                var panes = $scope.panes = [];
                this.addPane = function(pane) {
                    panes.push(pane);
                }
                
                this.getType = function() {
                    return $scope.type;
                }
                
                this.getId = function() {
                    return $scope.id;
                }
                
                this.getOpen = function(pane) {
                    return panes.length == 0;
                }
            },
            compile: function(element, attrs) {
                initAttr(attrs, 'acdType', 'default');
                initAttr(attrs, 'acdId', makeId('acd'));
                return function(scope, element, attrs) {
                    element.on('shown.bs.collapse', function(evt) {
                        scope.shown && scope.$apply(scope.shown({pane: $(evt.target).scope()}));
                    });
                }
            }
        }
    });
    
    utk.directive('utkAccordionPanel', function() {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            require: '^utkAccordion',
            scope: {
                id: '@apnId',
                title: '@apnTitle'
            },
            template: '<div class="panel panel-{{type}}">' +
                        '<div class="panel-heading">' +
                          '<h4 class="panel-title">' +
                            '<div data-toggle="collapse" data-parent="#{{containerId}}" data-target="#{{id}}">' +
                              '{{title}}' +
                            '</div>' +
                          '</h4>' +
                        '</div>' +
                        '<div id="{{id}}" class="panel-collapse collapse" ng-class="{in: open}">' +
                          '<div class="panel-body" ng-transclude>' +
                          '</div>' +
                        '</div>' +
                      '</div>',
            compile: function(element, attrs) {
                initAttr(attrs, 'apnId', makeId('apn'));
                return function(scope, element, attrs, accdCtrl) {
                    scope.open = accdCtrl.getOpen();
                    scope.containerId = accdCtrl.getId();
                    scope.type = accdCtrl.getType();
                    accdCtrl.addPane(scope);
                }
            }
        }
    });
    
    utk.directive('utkBrowseButton', function() {
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                type: '@btnType',
                text: '@btnText',
                accept: '@btnAccept',
                multiple: '@btnMultiple',
                selected: '&btnSelected',
                icon: '@btnIcon',
                size: '@btnSize',
                disabled: '@btnDisabled'
            },
            template: '<span class="btn btn-{{type}} btn-file" ng-class="{\'btn-lg\': size==\'large\', \'btn-sm\': size==\'small\', \'btn-xs\': size==\'xsmall\'}" ng-disabled="disabled===true||disabled==\'true\'">' +
                        '<span ng-if="icon" class="glyphicon glyphicon-{{icon}}" style="margin-right: 4px;"></span>' +
                        '{{text}}' + 
                        '<input ng-if="multiple==\'true\'" accept={{accept}} type="file" multiple="true">' +
                        '<input ng-if="multiple!=\'true\'" accept={{accept}} type="file">' +
                      '</span>',
            compile: function(element, attrs) {
                initAttr(attrs, 'btnType');
                initAttr(attrs, 'btnText', 'Browse...');
                return function(scope, element, attrs) {
                    element.on('change', function() {
                        var input = element.find('input').eq(0);
                        var fileNums = input.prop('files') ? input.prop('files').length : 1;
                        var fileName = input.val().replace(/\\/g, '/').replace(/.*\//, '');						
                        scope.selected && scope.$apply(scope.selected({filename: fileName, number: fileNums}));
                    });
                }
            }
        }
    });
    
    utk.directive('utkCarousel', function() {
        function getPrev(cur, len) {
            if(cur == 0) {
                return len - 1;
            } else {
                return cur - 1;
            }
        };
        
        function getNext(cur, len) {
            if(cur == len - 1) {
                return 0;
            } else {
                return cur + 1;
            }
        };
        
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                id: '@crsId',
                indicator: '@crsIndicator',
                navigator: '@crsNavigator',
                items: '=crsItems',
                interval: '@crsInterval'
            },
            template: '<div id="{{id}}" class="carousel">' +
                            '<ol ng-if="indicator==\'true\'" class="carousel-indicators">' +
                                '<li ng-repeat="item in items" data-target="#{{id}}" ng-click="go($index)" data-slide-to="{{$index}}" ng-class="{active: $index==0}"></li>' +
                            '</ol>' +
                            '<div class="carousel-inner">' +
                                '<div ng-repeat="item in items" class="item" ng-class="{active: $index==0}">' +
                                    '<img ng-src="{{item.img}}" alt="{{item.alt}}">' +
                                    '<div class="carousel-caption">{{item.text}}</div>' +
                                '</div>' +
                            '</div>' +
                          '<a ng-if="navigator==\'true\'" class="left carousel-control" ng-click="prev()" role="button" data-slide="prev">' +
                            '<span class="glyphicon glyphicon-chevron-left"></span>' +
                          '</a>' +
                          '<a ng-if="navigator==\'true\'" class="right carousel-control" ng-click="next()" role="button" data-slide="next">' +
                            '<span class="glyphicon glyphicon-chevron-right"></span>' +
                          '</a>' +
                        '</div>',
            controller: function($scope, $element) {
                $scope.current = 0;
                $scope.ignoreEvt = false;
                $scope.prev = function() {
                    $scope.ignoreEvt = true;
                    $element.carousel('prev');
                    $scope.current = getPrev($scope.current, $scope.items.length);
                };
                
                $scope.next = function() {
                    $scope.ignoreEvt = true;
                    $element.carousel('next');
                    $scope.current = getNext($scope.current, $scope.items.length);
                };
                
                $scope.go = function(idx) {
                    $scope.ignoreEvt = true;
                    $scope.current = idx;					
                };
            },
            compile: function(element, attrs) {
                initAttr(attrs, 'crsId', makeId('crs'));
                initAttr(attrs, 'crsInterval', '5000');
                return function(scope, element, attrs) {
                    element.carousel({
                        interval: parseInt(scope.interval)
                    });
                    
                    $(element).on('slide.bs.carousel', function (evt) {
                        if(scope.ignoreEvt) {
                            scope.ignoreEvt = false;
                            return;							
                        }						
                        
                        if(evt.direction == 'left'){
                            scope.$apply(function() {
                                scope.current = getNext(scope.current, scope.items.length);
                            });
                        }
                        if(evt.direction == 'right'){
                            scope.$apply(function() {
                                scope.current = getPrev(scope.current, scope.items.length);
                            });
                        }
                    })
                    
                    scope.$watch('current', function(x) {
                        element.find('li').removeClass('active');
                        element.find('li[data-slide-to=' + x + ']').eq(0).addClass('active');
                    });
                }
            }
        }
    });
    
    utk.directive('utkPopover', function() {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                title: '@ppvTitle',
                text: '@ppvText',
                container: '@ppvContainer',
                placement: '@ppvPlacement',
                trigger: '@ppvTrigger'
            },
            template: '<span ng-transclude></span>',
            compile: function(element, attrs) {
                initAttr(attrs, 'ppvTrigger', 'hover');
                initAttr(attrs, 'ppvContainer', false);
                initAttr(attrs, 'ppvPlacement', 'auto');
                return function(scope, element, attrs) {
                    function make() {
                        element.popover('destroy');
                        element.popover({
                            title: scope.title,
                            content: scope.text,
                            trigger: scope.trigger,
                            placement: scope.placement,
                            container: (scope.container == 'false' || scope.container == false) ? false : scope.container,
                            html: true
                        });
                    }
                    scope.$watchGroup(['title', 'text'], make);
                    scope.$watch('placement', make);
                    scope.$watch('trigger', make);
                }
            }
        }
    });

    utk.directive('utkCode', function($timeout) {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                language: '@cdLang',
                escape: '@cdEscape',
                lineNumber: '@cdLineNumber'
            },
            template: '<pre ng-class="{\'line-numbers\':lineNumber==\'true\'}"><code class="language-{{name}}" ng-transclude>' +
                      '</code></pre>',
            compile: function(element, attrs) {
                initAttr(attrs, 'cdEscape', 'true');
                initAttr(attrs, 'cdLineNumber', 'true');
                return function(scope, element, attrs, ctrl) {
                    switch(scope.language) {
                        case 'js':
                        case 'javascript':
                            scope.name = 'javascript';
                            break;

                        case 'html':
                        case 'markup':
                            scope.name = 'markup';
                            break;
                    }
                    
                    $timeout(function() {
                        Prism.highlightElement(element.find('code').get(0));
                    }, 0);
                }
            }
        }
    });
    
    utk.directive('utkCalendar', function($compile, $filter, parseDate) {
        var lbl = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
        var head = '', line = '', grid = '';
        for(var i = 0; i < lbl.length; i++) {
            //line += '<td><utk-label lbl-text="' + lbl[i] + '"></td>';
            line += '<td class="calendar-head">' + lbl[i] + '</td>';
            head += '<th class="col-sm-1"></th>';
        };
        for(var i = 0; i < 6; i++) {
            grid += '<tr>';
            for(var j = 0; j < 7; j++) {
                grid += '<td class="calendar-date" ng-click="clickDate($event)">&nbsp;</td>';
            }
            grid += '</tr>';
        };
        
        var tbl =   '<table class="calendar">' +
                        '<thead><tr>' +
                            head +
                        '</tr></thead>' +
                        '<tbody><tr>' +
                            '<td class="calendar-date calendar-head" ng-click="clickPrevYear()">&lt;</td><td colspan="2"></td><td class="calendar-date calendar-head" ng-click="clickNextYear()">&gt;</td><td class="calendar-date calendar-head" ng-click="clickPrevMonth()">&lt;</td><td></td><td class="calendar-date calendar-head" ng-click="clickNextMonth()">&gt;</td>' +
                        '</tr></tbody>' +
                        line +
                        grid +
                    '</table>';
        function getPopover(element) {
            var id = element.attr('aria-describedby');
            return $('#' + id, element.parent());
        };
        
        function getTable(element) {
            var id = element.attr('aria-describedby');
            return $('#' + id, element.parent()).find('table').eq(0);
        };
                    
        function getTd(t, row, col) {
            return t.find('tr').eq(row).find('td').eq(col);
        };
                    
        function setupTable(t, selected, dateEnable) {
            var y = selected.getFullYear(), m = selected.getMonth() + 1, d = selected.getDate();
            getTd(t, 1, 1).text(y);
            getTd(t, 1, 4).text(m);
            
            var first = new Date(y, m - 1, 1);
            var prevLast = new Date();
            prevLast.setTime(first.getTime() - 24 * 3600 * 1000);
            var nextFirst = new Date(y, m, 1);
            var length = Math.floor((nextFirst.getTime() - first.getTime()) / 1000 / 24 / 3600);
            
            var col = first.getDay();
            var row = 3;			
            for (var i = 0; i < col; i++) {
                var day = prevLast.getDate() - col + i + 1;
                var td = getTd(t, row, i);
                td.text(day).addClass('disable');
            }
            
            for (var day = 1; day < length + 1; day++) {
                var td = getTd(t, row, col);
                td.text(day);
                if(dateEnable) {
                    if(dateEnable({date: {year: y, month: m, day: day}}))
                        td.removeClass('disable');
                    else
                        td.addClass('disable');
                } else {
                    td.removeClass('disable');
                }
                if(d == day)
                    td.addClass('selected');
                else
                    td.removeClass('selected');
                col++;
                if (col == 7) {
                    col = 0;
                    row++;
                }
            }
            
            for (var day = 1; day < 14; day++) {
                if (row == 9)
                    break;
                var td = getTd(t, row, col);
                td.text(day).addClass('disable');
                col++;
                if (col == 7) {
                    col = 0;
                    row++;
                }
            }
        };
    
        return {
            restrict: 'AE',
            replace: true,
            scope: {
                format: '@cldFormat',
                placement: '@cldPlacement',
                pick: '&cldPick',
                dateEnable: '&cldDateEnable'
            },
            template: '<input type="text">',
            require: '?ngModel',
            controller: function($scope, $element) {
                var ngModel = null;
                $scope.setModel = function(ngCtrl) {
                    ngModel = ngCtrl;
                };
            
                $scope.clickDate = function(e) {
                    if($(e.target).hasClass('disable'))
                        return;                    
                    $element.popover('toggle');
                    $scope.selected.setDate($(e.target).text());
                    var str = $filter('date')($scope.selected, $scope.format);
                    $element.val(str);
                    $scope.pick && $scope.pick({date: $scope.selected});
                    ngModel && ngModel.$setViewValue(str);
                };
                
                $scope.clickPrevYear = function() {
                    var y = $scope.selected.getFullYear();
                    $scope.selected.setFullYear(y - 1);
                    
                    var t = getTable($element);
                    setupTable(t, $scope.selected, $scope.dateEnable);
                };
                
                $scope.clickNextYear = function() {
                    var y = $scope.selected.getFullYear();
                    $scope.selected.setFullYear(y + 1);
                    
                    var t = getTable($element);
                    setupTable(t, $scope.selected, $scope.dateEnable);
                };
                
                $scope.clickPrevMonth = function() {
                    var m = $scope.selected.getMonth();
                    m = m - 1;
                    if(m < 0) {
                        m = 11;
                        var y = $scope.selected.getFullYear();
                        $scope.selected.setFullYear(y - 1);
                    }
                    $scope.selected.setMonth(m);
                    
                    var t = getTable($element);
                    setupTable(t, $scope.selected, $scope.dateEnable);
                };
                
                $scope.clickNextMonth = function() {
                    var m = $scope.selected.getMonth();
                    m = m + 1;
                    if(m > 11) {
                        m = 0;
                        var y = $scope.selected.getFullYear();
                        $scope.selected.setFullYear(y + 1);
                    }
                    $scope.selected.setMonth(m);
                    
                    var t = getTable($element);
                    setupTable(t, $scope.selected, $scope.dateEnable);
                };
            },
            compile: function(element, attrs) {
                initAttr(attrs, 'cldFormat', 'MM-dd-yyyy');
                return function(scope, element, attrs, ngCtrl) {
                    scope.setModel(ngCtrl);
                    
                    if(ngCtrl && parseDate(ngCtrl.$modelValue, scope.format))
                        element.val(ngCtrl.$modelValue);
                
                    function make() {
                        element.popover('destroy');
                        element.popover({
                            content: tbl,
                            trigger: 'click',
                            placement: scope.placement,
                            html: true
                        });
                        
                        element.on('shown.bs.popover', function() {
                            if(!scope.selected) {
                                var seed = parseDate(element.val(), scope.format);
                                if(seed == null) {						
                                    if(ngCtrl && ngCtrl.$modelValue) {
                                        seed = parseDate(ngCtrl.$modelValue, scope.format);
                                    }
                                }
                                if(seed == null)
                                    seed = new Date();
                                scope.selected = seed;
                            }
                            
                            var t = getTable(element);
                            setupTable(t, scope.selected, scope.dateEnable);
                            $compile(getPopover(element).contents())(scope);
                        });
                        
                        if (ngCtrl) {
                            ngCtrl.$render = function () {
                                element.val(ngCtrl.$modelValue);
                            }
                        }
                    }
                    
                    scope.$watch('placement', make);
                }
            }
        }
    });
    
    utk.directive('utkFlip', function($timeout) {
        return {
            restrict: 'AE',
            replace: true,
            transclude: true,
            scope: {
                id: '@flpId',
                height: '@flpHeight',
                width: '@flpWidth',
                trigger: '@flpTrigger', //hover|manual
                side: '@flpSide' //front|back
            },
            template: '<div id="{{id}}" class="flipper" ng-style="{height: height, width: width}" ng-transclude></div>',
            controller: function($scope, $element){
            },
            compile: function(element, attrs) {
                initAttr(attrs, 'flpId', makeId('flp'));
                initAttr(attrs, 'flpTrigger', 'hover');
                initAttr(attrs, 'flpWidth', '200px');
                initAttr(attrs, 'flpHeight', '200px');
                return function(scope, element, attrs) {
                    $timeout(function(){
                        var flip = $('#'+scope.id).eq(0);
                        function turn(side) {
                            switch(side) {
                                case 'front':
                                    $('.front-side', flip).css('transform', 'rotatex(0deg)');
                                    $('.back-side', flip).css('transform', 'rotatex(180deg)');
                                    break;
                                    
                                case 'back':
                                    $('.front-side', flip).css('transform', 'rotatex(180deg)');
                                    $('.back-side', flip).css('transform', 'rotatex(0deg)');
                                    break;
                            }
                        }
                    
                        if(scope.trigger == 'hover') {
                            flip.mouseover(function(){
                                turn('back');
                            }).mouseleave(function(){
                                turn('front');
                            });
                        }
                        
                        if(scope.trigger == 'manual') {
                            scope.$watch('side', function(){								
                                turn(scope.side);
                            });
                        }
                    }, 0);
                }
            }
        }
    });
    
    utk.directive('utkFlipFront', function() {
        return {
            restrict: 'AE',
            require: '^utkFlip',
            replace: true,
            transclude: true,
            scope: {
                type: '@flpType',
                lineHeight: '@flpLineHeight'
            },
            template: '<div class="flipper-side flipper-side-{{type}} front-side" ng-style="{lineHeight: lineHeight}" ng-transclude></div>',
            compile: function(element, attrs) {
                initAttr(attrs, 'flpType', 'primary');
                initAttr(attrs, 'flpLineHeight', '200px');
                return function(scope, element, attrs) {
                }
            }
        }
    });
    
    utk.directive('utkFlipBack', function() {
        return {
            restrict: 'AE',
            require: '^utkFlip',
            replace: true,
            transclude: true,
            scope: {
                type: '@flpType',
                lineHeight: '@flpLineHeight'
            },
            template: '<div class="flipper-side flipper-side-{{type}} back-side" ng-style="{lineHeight: lineHeight}" ng-transclude></div>',
            compile: function(element, attrs) {
                initAttr(attrs, 'flpType', 'primary');
                initAttr(attrs, 'flpLineHeight', '200px');
                return function(scope, element, attrs) {
                }
            }
        }
    });
})();

