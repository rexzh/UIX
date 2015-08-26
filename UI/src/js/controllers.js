app.constant('ctrlTypes', [
    {name: "primary", value: "primary"},
    {name: "default", value: "default"},
    {name: "success", value: "success"},
    {name: "info", value: "info"},
    {name: "warning", value: "warning"},
    {name: "danger", value: "danger"}
]);

app.constant('icons', [
    {name: "none", value: null},
    {name: "ban-circle", value: "ban-circle"},
    {name: "remove", value: "remove"},
    {name: "ok", value: "ok"},
    {name: "minus", value: "minus"},
    {name: "plus", value: "plus"}
]);

app.constant('placement', [
    {name: "auto", value: "auto"},
    {name: "left", value: "left"},
    {name: "right", value: "right"},
    {name: "top", value: "top"},
    {name: "bottom", value: "bottom"}
]);

app.constant('trigger', [
    {name: 'click', value: 'click'},
    {name: 'hover', value: 'hover'},
    {name: 'focus', value: 'focus'},
    {name: 'manual', value: 'manual'}
]);

app.controller('HeaderCtrl', function ($scope, appRoute, menu) {
    $scope.menu = menu(appRoute);
});


app.controller('HomeCtrl', function ($scope) {
});

app.controller('TabCtrl', function ($scope) {
    $scope.tabChanged = function(t) {
        console.log(t.tabHeader);
    }
});

app.controller('ColorCtrl', function ($scope) {

    $scope.colorArray = [
        ['AF141B', 'F9A006', 'FCDD4D', '8CC520'],
        ['06CAB1', '165676', '673882', '404040']
    ];

    $scope.colorGradient = [
        ['AF141B', '970D13'],
        ['F9A006', 'D97E00'],
        ['FCDD4D', 'DCBF40'],
        ['8CC520', '72AA15'],
        ['06CAB1', '00AE96'],
        ['165676', '0E4664'],
        ['673882', '552B6D'],
        ['767676', '5A5A5A']
    ];
});

app.controller('LabelCtrl', function ($scope, ctrlTypes) {
    $scope.lbl = { text: "New", type: "primary"};
    
    $scope.types = ctrlTypes;
});

app.controller('BadgeCtrl', function ($scope) {
    $scope.bdg = { text: "12"};
});

app.controller('ButtonCtrl', function ($scope, ctrlTypes, icons) {
    $scope.btn = {text: 'OK', icon: 'ok', type: 'info', size: 'normal', disabled: false};
    
    $scope.types = ctrlTypes;
    
    $scope.icons = icons;
});

app.controller('CheckboxCtrl', function ($scope, ctrlTypes) {
    $scope.agree = true;
    $scope.chk = {text: 'agree', type: 'primary', disabled: false};
    $scope.types = ctrlTypes;
});

app.controller('RadiobuttonCtrl', function ($scope, ctrlTypes) {
    $scope.x = 'N';
    $scope.y = 'X';
    $scope.rb = {text: ['Yes', 'No'], type: 'primary', disabled: false};
    $scope.types = ctrlTypes;
});

app.controller('PaginationCtrl', function ($scope) {
    $scope.pg = {
        total: 35,
        perPage: 10
    }
    $scope.current = 1;
    
    $scope.change = function(p) {
        $scope.current = p;
    }
});

app.controller('DropdownCtrl', function ($scope, ctrlTypes) {
    $scope.val = 2;
    $scope.dp = {type: 'none', disabled: false, width: '200px'};
    $scope.items = [
        {name: "One", value: 1},
        {name: "Two", value: 2},
        {name: "Three", value: 3}
    ];
    
    var types = ctrlTypes.slice(0);
    types.push({name: 'none', value: 'none'});
    $scope.types = types;
});

app.controller('AlertCtrl', function ($scope, ctrlTypes) {
    $scope.alt = {type: 'info'};
    
    var types = ctrlTypes.slice(2);
    $scope.types = types;
});

app.controller('FlipCtrl', function ($scope, ctrlTypes, $interval) {
    $scope.types = ctrlTypes;
    
    $scope.flp = {
        width: '200px',
        height: '200px',
        frontText: 'Server-X',
        frontType: 'primary',
        backText: 'Good',
        backType: 'default',
        trigger: "hover",
        side: "front"
    }
    /*
    $interval(function() {
        if($scope.flp.side == 'front')
            $scope.flp.side = 'back';
        else
            $scope.flp.side = 'front';
    }, 5000);
    */
});

app.controller('ProgressCtrl', function ($scope, ctrlTypes) {
    $scope.types = ctrlTypes;
    
    $scope.pgr = {
        progress: 50,
        type: 'primary',
        label: true
    };
});

app.controller('ListCtrl', function ($scope) {
    $scope.data = [
        { html: "Inbox", badge: 3 },
        { html: "Sent" },
        { html: "Draft", badge: 5 },
        { html: "delete", badge: 15 },
        { html: "<a ng-click='test()'>RSS1</a> | <a>RSS2</a> | <a>RSS3</a>" },
        { html: "sync error" }
    ];

    $scope.test = function(){
        console.log("!!");
    };
    $scope.itemClick = function (item) {
        console.log(item);
    }
});

app.controller('TooltipCtrl', function ($scope, placement, trigger) {
    $scope.tip = {text: 'Click to follow', placement: 'auto', trigger: 'hover'};
    $scope.placement = placement;
    $scope.trigger = trigger;
});

app.controller('AccordionCtrl', function ($scope) {
    $scope.shown = function(pane){
        console.log(pane.title);
    }
});


app.controller('PanelCtrl', function ($scope, ctrlTypes) {
    $scope.types = ctrlTypes;

    $scope.pnl = { type: 'primary' }
});

app.controller('InputCtrl', function ($scope, icons, ctrlTypes) {
    $scope.btn = {text: 'Choose File ...', icon: 'plus', type: 'primary', size: 'normal', disabled: false, multiple: false, accept: 'image/*'};
    
    $scope.types = ctrlTypes;
    $scope.icons = icons;
    
    $scope.selected = function(f, n) {
        $scope.choosed = (n > 1) ? n + ' files selected' : f;
    }
});

app.controller('WaitCtrl', function ($scope, $timeout, wait) {
    $scope.wait = {
        color: '#767676',
        speed: 1,
        lines: 12
    };

    $scope.spin = function() {
        wait.show($scope.wait);
        $timeout(function() {
            console.log('hide...');
            wait.hide();
        }, 3000);
    }
});

app.controller('MsgboxCtrl', function ($scope, msgbox) {
    $scope.msgbox = {
        title: 'Info',
        message: 'Done!',
        backdrop: false,
        keyboard: false
    };

    $scope.open = function() {
        msgbox.show({
            title: $scope.msgbox.title,
            message: $scope.msgbox.message,
            buttons: [
                { text: "OK", icon: "ok", value: true}
            ],
            backdrop: $scope.msgbox.backdrop,
            keyboard: $scope.msgbox.keyboard
        }).then(function(result){
            $scope.result = result;
        });
    };
});

app.controller('ModalXCtrl', function ($scope) {
    $scope.text="Text X";
    //console.log($scope.$params);
});

app.controller('ModalYCtrl', function ($scope) {
    $scope.text="Text Y";
});

app.controller('DialogCtrl', function ($scope, dialog) {
    $scope.dlg = {
        title: 'Info',
        backdrop: false,
        keyboard: false
    };
    
    $scope.open = function(){
        dialog.show({
            title: $scope.dlg.title,
            template: '<p>{{text}}</p>',            
            buttons: [
                { text: "OK", icon: "ok", value: true},
                { text: "Cancel", type: "default", icon: "remove", value: false }
            ],
            backdrop: $scope.dlg.backdrop,
            keyboard: $scope.dlg.keyboard,            
            params: {data: 10},
            scope: $scope
        }).then(function(result){
            $scope.result = result;
        });
    };
    
    $scope.openUrl = function(){
        dialog.show({
            title: 'Test',
            templateUrl: './html/modal.html',
            buttons: [
                { text: "OK", icon: "ok", value: true},
                { text: "Cancel", type: "default", icon: "remove", value: false }
            ],
            backdrop: $scope.backdrop,
            keyboard: $scope.keyboard
        }).then(function(data){
            console.log(data);
        });
    };
});

app.controller('CarouselCtrl', function ($scope) {
    $scope.items = [
        {img: './images/0.svg', text: 'ABC', alt: 'Text One'},
        {img: './images/1.svg', text: 'Pic Two', alt: 'Text Two'},
        {img: './images/2.svg', text: 'DEF', alt: 'Text Three'},
        {img: './images/3.svg', text: 'Pic Four', alt: 'Text Four'},
    ];

    $scope.crs = {
        indicator: true,
        navigator: true
    };
});

app.controller('TableCtrl', function ($scope) {
    $scope.data = [
        ['#', 'First Name', 'Last Name', 'Username'],
        ['1', 'Mark', 'Otto', '<a ng-click="click()">@mdo</a>'],
        ['2', 'Jacob', 'Thornton', '<a ng-click="click()">@fat</a>'],
        ['3', 'Larry the Bird', '', '<a ng-click="click()">@twitter</a>']
    ];
    
    $scope.tbl = {
        striped: false,
        hover: false,
        bordered: false,
        condensed: false
    }
    
    $scope.click = function() {
        console.log('click');
    }
});

app.controller('PopoverCtrl', function ($scope, placement, trigger) {
    $scope.ppv = {title: 'Attention:', text: 'Click to follow', placement: 'auto', trigger: 'hover'};
    $scope.placement = placement;
    $scope.trigger = trigger;
});

app.controller('BarChartCtrl', function ($scope) {
    $scope.data = { "20140723": [10, 7, 4], "20140724": [10, 12, 1], "20140725": [7, 3, 3], "20140726": [1, 5, 5], "20140727": [2, 3, 6]};
    $scope.chart = {
        width: 640, 
        height: 480, 
        margin: 60, 
        xSkip: 1,
        xText: 'Date', 
        yText: 'Money', 
        showTip: 'true', 
        legend: 'true',
        axisColor: '#767676',
        axisTextColor: '#767676',
        displayValue: true
    };
    /*
    $scope.colors = [
        ['#F9A006', '#D97E00'],
        ['#06CAB1', '#00AE96'],
        ['#8CC520', '#72AA15'],
        ['#767676', '#5A5A5A']
    ];
    */
    $scope.groupText = ['USD', 'EUR', 'CNY'];
    /*
    $scope.tipText = function(e,d,i){
        e.text(d + " [" + $scope.groupText[i % 3] + "] at Day " + Math.floor(i / 3));
    }
    */
    $scope.tipText = function(tip) {
        tip.element.text(tip.data + " [" + $scope.groupText[tip.index % 3] + "] at Day " + Math.floor(tip.index / 3));
    }
    
    $scope.generate = function() {
        var data = {};
        for(var d = 20140723; d <= 20140727; d++) {
            data[d+''] = [];
            for(var j = 0; j < 3; j++) {
                data[d+''].push(Math.ceil(Math.random() * 12));
            }
        }
        $scope.data = data;
    }
});

app.controller('CalendarCtrl', function ($scope, placement) {
    $scope.cld = {
        format: 'yyyy-MM-dd',
        placement: 'right'
    };
    $scope.placement = placement;
    $scope.pick = function(d) {
        console.log(d);
    }
    $scope.value = '2014-01-01';
    
    $scope.enable = function(d) {
        var date = new Date(d.year, d.month - 1, d.day);
        var w = date.getDay();
        if(w == 0 || w == 6)
            return false;
        return true;
    }
});

app.controller('ToastCtrl', function ($scope, toast, ctrlTypes) {
    $scope.types = ctrlTypes.slice(2);

    $scope.tst = {
        text: 'Message',
        type: 'info',
        sticky: false
    };

    var id = 0;
    $scope.toast = function() {
        toast.push($scope.tst.text, $scope.tst.type, $scope.tst.sticky);
    }
});

app.controller('LineChartCtrl', function ($scope) {
    $scope.chart = {
        width: 640, 
        height: 480, 
        margin: 60, 
        xSkip: 2,
        xText: 'Date', 
        yText: 'Money', 
        showTip: 'true', 
        legend: 'true',
        axisColor: '#767676',
        axisTextColor: '#767676'
    };
    $scope.data = { "20140723": [10, 7, 4], "20140724": [10, 12, 1], "20140725": [7, 3, 3], "20140726": [1, 5, 5], "20140727": [2, 3, 6]};
    
    $scope.groupText = ['USD', 'EUR', 'CNY'];
    
    $scope.tipText = function(tip){
        tip.element.text(tip.data + " [" + $scope.groupText[tip.index % 3] + "] at Day " + Math.floor(tip.index / 3));
    }
    
    $scope.generate = function() {
        var data = {};
        for(var d = 20140723; d <= 20140727; d++) {
            data[d+''] = [];
            for(var j = 0; j < 3; j++) {
                data[d+''].push(Math.ceil(Math.random() * 12));
            }
        }
        $scope.data = data;
    }
});

app.controller('PieChartCtrl', function ($scope) {
    $scope.data = { "IE": 44, "Chrome": 40, "Firefox": 20, "Opera": 3, "Safari": 2, "Other": 1};
    $scope.chart = {
        width: 640, 
        height: 480, 
        margin: 60,         
        showTip: true,
        legend: true,
        donuts: true
    };
    
    /*
    $scope.colors = [
        ['#F9A006', '#D97E00'],
        ['#06CAB1', '#00AE96'],
        ['#8CC520', '#72AA15'],
        ['#767676', '#5A5A5A'],
        ['#165676', '#0E4664'],
        ['#AF141B', '#AF141B']
    ];
    */

    $scope.tipText = function(tip) {
        tip.element.text(tip.data.key + ': ' + tip.data.value + ' (' + tip.data.percent + ')');
    }
    
    $scope.generate = function() {
        var data = {};
        for(var k in $scope.data) {
            data[k] = Math.ceil(Math.random() * 20);
        }
        $scope.data = data;
    }
});

app.controller('RadarChartCtrl', function ($scope) {
    $scope.data = { "Paladin": [10, 4, 10, 8, 5, 3], "Monk": [8, 6, 8, 6, 6, 9], "Necromancer": [6, 9, 4, 5, 7, 7]};
    $scope.groupText = ['HP', 'MP', 'ATK', 'DEF', 'MDF', 'DEX'];
    
    $scope.chart = {
        width: 480, 
        height: 480, 
        margin: 60,
        levels: 5,
        showTip: 'true', 
        legend: 'true',
        axisColor: '#767676',
        axisTextColor: '#767676'
    };
    
    $scope.tipText = function(tip){
        tip.element.text(tip.data.key + ': ' + $scope.groupText[tip.index] + ': ' + tip.data.value);
    };
    
    $scope.generate = function() {
        for(var k in $scope.data) {
            var data = [];
            for(var i = 0; i < 6; i++) {
                data.push(Math.ceil(Math.random() * 10));
            }
            $scope.data[k] = data;
        }
    };
});

app.controller('PlotChartCtrl', function ($scope) {
    $scope.data = { 
        "Red": [{x: 10, y: 10}, {x: 15, y: 20}, {x: 18, y: 17}], 
        "Green": [{x: 16, y: 8}, {x: 18, y: 9}, {x: 20, y: 19}],
        "Yellow": [{x: 3, y: 4}, {x: 6, y: 17}, {x: 7, y: 8}]
    };
    
    $scope.chart = {
        width: 600,
        height: 600,
        margin: 60,
        xText: 'X+',
        yText: 'Y+',
        showTip: 'true', 
        legend: 'true',
        axisColor: '#767676',
        axisTextColor: '#767676'
    };
    
    $scope.tipText = function(tip){		
        tip.element.text(tip.data.x + ", " + tip.data.y);
    };
    
    $scope.generate = function() {
        for(var k in $scope.data) {
            var data = [];
            for(var i = 0; i < 3; i++) {
                data.push({x: Math.ceil(Math.random() * 20), y: Math.ceil(Math.random() * 20)});
            }
            $scope.data[k] = data;
        }
    };
});