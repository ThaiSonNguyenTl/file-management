/**
 * ur.file: Native HTML5-based file input bindings for AngularJS
 *
 * @version 0.9a
 * @copyright (c) 2013 Union of RAD, LLC http://union-of-rad.com/
 * @license: BSD
 */


/**
 * The ur.file module implements native support for file uploads in AngularJS.
 */

angular.module('ur.file', []).config(['$provide', function($provide) {
    /**
   * XHR initialization, copied from Angular core, because it's buried inside $HttpProvider.
   */
  var XHR = window.XMLHttpRequest || function() {
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) {}
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) {}
    throw new Error("This browser does not support XMLHttpRequest.");
  };

  /**
   * Initializes XHR object with parameters from $httpBackend.
   */
  function prepXHR(method, url, headers, callback, withCredentials, type, manager) {
    var xhr = new XHR();
    var status;

    xhr.open(method, url, true);

    if (type) {
      xhr.type = type;
      headers['Content-Type'] = type;
    }

    angular.forEach(headers, function(value, key) {
      (value) ? xhr.setRequestHeader(key, value) : null;
    });

    manager.register(xhr);

    xhr.onreadystatechange = function() {
      if (xhr.readyState == 4) {
        manager.unregister(xhr);
        var response = xhr.response || xhr.responseText;
        callback(status = status || xhr.status, response, xhr.getAllResponseHeaders());
      }
    };

    if (withCredentials) {
      xhr.withCredentials = true;
    }
    return xhr;
  }
}]).service('fileHandler', ['$q', '$rootScope', function($q, $rootScope) {

}]).service('uploadManager', ['$rootScope', function($rootScope) {

}]).directive('type', ['$parse', function urModelFileFactory($parse) {

}]).directive('dropTarget', ['$parse', 'fileHandler', function urDropTargetFactory($parse, fileHandler) {

}]);