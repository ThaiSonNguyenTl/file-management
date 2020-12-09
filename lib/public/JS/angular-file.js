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

angular.module('ur.file', []).config(['$provide', function ($provide) {
  /**
 * XHR initialization, copied from Angular core, because it's buried inside $HttpProvider.
 */
  var XHR = window.XMLHttpRequest || function () {
    try { return new ActiveXObject("Msxml2.XMLHTTP.6.0"); } catch (e1) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP.3.0"); } catch (e2) { }
    try { return new ActiveXObject("Msxml2.XMLHTTP"); } catch (e3) { }
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

    angular.forEach(headers, function (value, key) {
      (value) ? xhr.setRequestHeader(key, value) : null;
    });

    manager.register(xhr);

    xhr.onreadystatechange = function () {
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

  /**
   * Hook into $httpBackend to intercept requests containing files.
   */
  $provide.decorator('$httpBackend', ['$delegate', '$window', 'uploadManager', function ($delegate, $window, uploadManager) {
    return function (method, url, post, callback, headers, timeout, wc) {
      var containsFile = false, result = null, manager = uploadManager;

      if (post && angular.isObject(post)) {
        containsFile = hasFile(post);
      }

      if (angular.isObject(post)) {
        if (post && post.name && !headers['X-File-Name']) {
          headers['X-File-Name'] = encodeURI(post.name);
        }

        angular.forEach({
          size: 'X-File-Size',
          lastModifiedDate: 'X-File-Last-Modified'
        }, function (header, key) {
          if (post && post[key]) {
            if (!headers[header]) headers[header] = post[key];
          }
        });
      }

      if (post && post instanceof Blob) {
        return prepXHR(method, url, headers, callback, wc, post.type, manager).send(post);
      }
      $delegate(method, url, post, callback, headers, timeout, wc);
    }
  }]);

  /**
   * Checks an object hash to see if it contains a File object, or, if legacy is true, checks to
   * see if an object hash contains an <input type="file" /> element.
   */
  var hasFile = function (data) {
    for (var n in data) {
      if (data[n] instanceof Blob) {
        return true;
      }
      if ((angular.isObject(data[n]) || angular.isArray(data[n])) && hasFile(data[n])) {
        return true;
      }
    }
    return false;
  };

  /**
   * Prevents $http from executing its default transformation behavior if the data to be
   * transformed contains file data.
   */
  $provide.decorator('$http', ['$delegate', function ($delegate) {
    var transformer = $delegate.defaults.transformRequest[0];

    $delegate.defaults.transformRequest = [function (data) {
      return data instanceof Blob ? data : transformer(data);
    }];
    return $delegate;
  }]);

}]).service('fileHandler', ['$q', '$rootScope', function ($q, $rootScope) {

}]).service('uploadManager', ['$rootScope', function ($rootScope) {
  return {
    /**
     * Loads a file as a data URL and returns a promise representing the file's value.
     */
    load: function (file) {
      var deferred = $q.defer();

      var reader = angular.extend(new FileReader(), {
        onload: function (e) {
          deferred.resolve(e.target.result);
          if (!$rootScope.$$phase) $rootScope.$apply();
        },
        onerror: function (e) {
          deferred.reject(e);
          if (!$rootScope.$$phase) $rootScope.$apply();
        },
        onabort: function (e) {
          deferred.reject(e);
          if (!$rootScope.$$phase) $rootScope.$apply();
        }
        // onprogress: Gee, it'd be great to get some progress support from $q...
      });
      reader.readAsDataURL(file);

      return angular.extend(deferred.promise, {
        abort: function () { reader.abort(); }
      });
    },

    /**
     * Returns the metadata from a File object, including the name, size and last modified date.
     */
    meta: function (file) {
      return {
        name: file.name,
        size: file.size,
        lastModifiedDate: file.lastModifiedDate
      };
    },
  };

}]).directive('type', ['$parse', function urModelFileFactory($parse) {

}]).directive('dropTarget', ['$parse', 'fileHandler', function urDropTargetFactory($parse, fileHandler) {

}]);