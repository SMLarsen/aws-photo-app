app.directive('fileModel', ['$parse', function($parse) {
    return {
        restrict: 'A', //restrict to attribute
        link: function(scope, element, attrs) {
            let model = $parse(attrs.fileModel);
            let modelSetter = model.assign;
            element.bind('change', function() { //when element changes, execute this function
                scope.$apply(function() {
                    console.log("Image selected: ", element[0].files);
                    modelSetter(scope, element[0].files);
                });
            });
        }
    };
}]); //end directive