var app = angular.module('AppModule', ['ngRoute', 'utk.directive', 'utk.directive.chart']);

app.constant('appRoute', {
    'Home': { name: 'Home', path: '#/Home', templateUrl: 'html/home.html', controller: 'HomeCtrl' },
    'Color': { name: 'Color', path: '#/Color', templateUrl: 'html/color.html', controller: 'ColorCtrl' },

    'Button': { name: 'Button', path: '#/Button', templateUrl: 'html/Button.html', controller: "ButtonCtrl" },
    'Input': { name: 'Input', path: '#/Input', templateUrl: 'html/Input.html', controller: "InputCtrl" },
    'Checkbox': { name: 'Checkbox', path: '#/Checkbox', templateUrl: 'html/Checkbox.html', controller: "CheckboxCtrl" },
    'Radiobutton': { name: 'Radiobutton', path: '#/Radiobutton', templateUrl: 'html/radiobutton.html', controller: "RadiobuttonCtrl" },
    'Dropdown': { name: 'Dropdown', path: '#/Dropdown', templateUrl: 'html/Dropdown.html', controller: "DropdownCtrl" },
    'Panel': { name: 'Panel', path: '#/Panel', templateUrl: 'html/Panel.html', controller: "PanelCtrl" },
    'List': { name: 'List', path: '#/List', templateUrl: 'html/List.html', controller: "ListCtrl" },
    'Progress': { name: 'Progress', path: '#/Progress', templateUrl: 'html/Progress.html', controller: "ProgressCtrl" },
    'Alert': { name: 'Alert', path: '#/Alert', templateUrl: 'html/Alert.html', controller: "AlertCtrl" },
    'Popover': { name: 'Popover', path: '#/Popover', templateUrl: 'html/Popover.html', controller: "PopoverCtrl" },
    'Badge': { name: 'Badge', path: '#/Badge', templateUrl: 'html/Badge.html', controller: "BadgeCtrl" },
    'Label': { name: 'Label', path: '#/Label', templateUrl: 'html/Label.html', controller: "LabelCtrl" },
    'Flip': { name: 'Flip', path: '#/Flip', templateUrl: 'html/Flip.html', controller: "FlipCtrl" },
    'Tooltip': { name: 'Tooltip', path: '#/Tooltip', templateUrl: 'html/Tooltip.html', controller: "TooltipCtrl" },
    'Toast': { name: 'Toast', path: '#/Toast', templateUrl: 'html/Toast.html', controller: "ToastCtrl" },
    'Dialog': { name: 'Dialog', path: '#/Dialog', templateUrl: 'html/Dialog.html', controller: "DialogCtrl" },
    'Msgbox': { name: 'Msgbox', path: '#/Msgbox', templateUrl: 'html/Msgbox.html', controller: "MsgboxCtrl" },
    'Wait': { name: 'Wait', path: '#/Wait', templateUrl: 'html/Wait.html', controller: "WaitCtrl" },
    'Tab': { name: 'Tab', path: '#/Tab', templateUrl: 'html/Tab.html', controller: "TabCtrl" },
    'Carousel': { name: 'Carousel', path: '#/Carousel', templateUrl: 'html/Carousel.html', controller: "CarouselCtrl" },
    'Pagination': { name: 'Pagination', path: '#/Pagination', templateUrl: 'html/Pagination.html', controller: "PaginationCtrl" },
    'Calendar': { name: 'Calendar', path: '#/Calendar', templateUrl: 'html/Calendar.html', controller: "CalendarCtrl" },
    'Accordion': { name: 'Accordion', path: '#/Accordion', templateUrl: 'html/Accordion.html', controller: "AccordionCtrl" },
    'Table': { name: 'Table', path: '#/Table', templateUrl: 'html/Table.html', controller: "TableCtrl" },
    'Grid': { name: 'Grid', path: '#/Grid', templateUrl: 'html/Grid.html', controller: "GridCtrl" },
    'Line': { name: 'Line Chart', path: '#/Line', templateUrl: 'html/LineChart.html', controller: "LineChartCtrl" },
    'Bar': { name: 'Bar Chart', path: '#/Bar', templateUrl: 'html/BarChart.html', controller: "BarChartCtrl" },
    'Pie': { name: 'Pie Chart', path: '#/Pie', templateUrl: 'html/PieChart.html', controller: "PieChartCtrl" },
    'Radar': { name: 'Radar Chart', path: '#/Radar', templateUrl: 'html/RadarChart.html', controller: "RadarChartCtrl" },
    'Plot': { name: 'Plot Chart', path: '#/Plot', templateUrl: 'html/PlotChart.html', controller: "PlotChartCtrl" },
    'About': { name: 'About', path: '#/About', templateUrl: 'html/About.html', controller: "AboutCtrl" }
});

app.value('menu', function (appRoute) {
    var wip = [];
    var na = ['Grid'];
    wip.forEach(function(k){
        appRoute[k].name = appRoute[k].name + '&nbsp;<utk-label lbl-type="info" lbl-text="WIP"></utk-label>';
    });
    na.forEach(function(k){
        appRoute[k].name = appRoute[k].name + '&nbsp;<utk-label lbl-type="warning" lbl-text="N/A"></utk-label>';
    });

    return [
        appRoute['Home'],

        {
            name: 'Common',
            dropdown: [
                appRoute['Button'],
                appRoute['Checkbox'],
                appRoute['Radiobutton'],
                appRoute['Dropdown'],
                appRoute['Input'],
                appRoute['Calendar'],
                { divider: true },
                appRoute['Alert'],
                appRoute['Progress'],
                appRoute['Badge'],
                appRoute['Label'],
                appRoute['Tooltip'],
                appRoute['Popover'],
                appRoute['Flip'],
                { divider: true },
                appRoute['Carousel'],
                appRoute['Pagination']
                
            ]
        },
        {
            name: 'Component',
            dropdown: [
                appRoute['Tab'],
                appRoute['Panel'],
                appRoute['Accordion'],
                { divider: true },
                appRoute['List'],
                appRoute['Table'],
                appRoute['Grid']
            ]
        },
        {
            name: 'Service',
            dropdown: [
                appRoute['Wait'],
                { divider: true },
                appRoute['Msgbox'],
                appRoute['Dialog'],
                appRoute['Toast']
            ]
        },
        {
            name: 'Graph',
            dropdown: [
                appRoute['Line'],
                appRoute['Bar'],
                { divider: true },
                appRoute['Plot'],
                { divider: true },
                appRoute['Pie'],
                appRoute['Radar']
            ]
        },
        {
            name: 'Help',
            dropdown: [
                appRoute['Color'],
                appRoute['About']
            ]
        }
    ];
});

app.config(function ($routeProvider, appRoute) {
    for(var k in appRoute) {
        var r = appRoute[k];
        $routeProvider.when(r.path.substr(1), {templateUrl: r.templateUrl, controller: r.controller});
    }
    $routeProvider.otherwise({ redirectTo: "/Home" });
})
