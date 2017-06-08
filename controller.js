(function() {
  'use strict';

  angular
    .module('calendarmonth', [])
    .controller('calendarmonthController', loadFunction);

  loadFunction.$inject = ['$scope', 'structureService', '$location', 'gCalendarService'];

  function loadFunction($scope, structureService, $location, gCalendarService) {

    structureService.registerModule($location, $scope, 'calendarmonth');
    var moduleConfig  = $scope.calendarmonth.modulescope;
    moment.locale(moduleConfig.locale);
    $scope.locale     = moduleConfig.locale;
    $scope.apiKey     = moduleConfig.apiKey;
    $scope.calendarId = moduleConfig.calendarId;
    $scope.events     = [];
    $scope.actualView = moment();
    $scope.actualDay  = angular.copy($scope.actualView);
    $scope.nameDays   = moment.weekdaysShort(true);
    chargeView($scope.actualView);

    function chargeView(view) {
      $scope.arrWeeks  = [];
      $scope.startView = moment(view).startOf('month');
      $scope.events    = [];
      var endView      = moment(view).endOf('month');
      var auxStartView = angular.copy($scope.startView);
      var auxEndView   = angular.copy(endView);
      var weeks        = moment($scope.startView.startOf('week'));
      getEventList($scope.calendarId, $scope.apiKey, auxStartView, auxEndView);
      do {
        $scope.arrWeeks.push([weeks]);
        weeks = moment($scope.startView.add(1, 'weeks'));
      } while (endView.month() === $scope.startView.month());
      walkWeeks($scope.arrWeeks);
    };

    function walkWeeks(weeks) {
      for (var i = 0; i < weeks.length; i++) {
        feedDays(weeks[i]);
      }
    }

    function feedDays(week) {
      var aux = angular.copy(week[0]);
      for (var i = 0; i <= 5; i++) {
        var addDay = moment(aux.add(1, 'days'));
        week.push(addDay);
      }
    }

    $scope.changeViewMonth = function(prev) {
      if (prev) {
        $scope.actualView.subtract(1, 'months');
        chargeView($scope.actualView);
      }
      else {
        $scope.actualView.add(1, 'months');
        chargeView($scope.actualView);
      }
    }

    $scope.isActualDay = function (day) {
      var isSameStringDate  = $scope.actualDay.format('MM DD YYYY') === day.format('MM DD YYYY');
      return (isSameStringDate && $scope.isSameMonth(day));
    }

    $scope.isWeekend = function(day,locale){
      var isWeekendDay = undefined;
      switch (locale) {
        case ('es'):
          isWeekendDay = day.format('ddd') === 'sáb.' || day.format('ddd') === 'dom.';
          break;
        case ('en'):
          isWeekendDay = day.format('ddd') === 'Sat' || day.format('ddd') === 'Sun';
          break;
      }
     return (isWeekendDay && $scope.isSameMonth(day));

    }

    $scope.isSameMonth = function(day){
     return (day.month() === $scope.actualView.month());
    }

    function getEventList(calendarId, apiKey, start, end) {
      $scope.emptyMonthEvents = undefined;
      var promise = gCalendarService.getEvents(calendarId, apiKey, start, end);
      promise
        .then(function(result) {
          if(result.events.length != 0){
            $scope.events = result.events;
            walkDays($scope.events);
          }
          else $scope.emptyMonthEvents = 'No hay eventos este mes';

        })
    }

    function walkDays(events){
      for (var i = 0; i < $scope.arrWeeks.length; i++) {
        for (var j = 0; j < $scope.arrWeeks[i].length; j++) {
          addDotPoints($scope.arrWeeks[i][j], events);
        }
      }
    }

    function addDotPoints(day, events){
      for(var i=0;i<events.length;i++){
        var isSameDay = events[i].start.date ? (day.format('YYYY-MM-DD') === events[i].start.date) :
                                               (day.format('YYYY-MM-DD') === events[i].start.dateTime.substr(0,10))
        if(isSameDay) day.dot = 'true';
      }
    }
  }
}());
