var FMApp = angular.module('FMApp', ['ur.file']);

FMApp.controller('FileManagerCtr', ['$scope', '$http', '$location',
  function ($scope, $http, $location) {
    var FM = this;
    FM.curHashPath = '#/';          // hash in browser url
    FM.curFolderPath = '/';         // current relative folder path
    FM.curBreadCrumbPaths = [];     // items in breadcrumb list, for each level folder
    FM.curFiles = [];               // files in current folder

    FM.selecteAll = false;          // if select all files
    FM.selection = [];              // selected files
    FM.renameName = '';             // new name for rename action
    FM.uploadFile = null;           // will upload file
    FM.newFolderName = '';
    FM.successData = '__init__';
    FM.errorData = '__init__';
    FM.updateArchiveName = function() {
      FM.archiveTarget = 'files_' + FM.curFolderPath.substring(1).replace(/\//g, '_') + new Date().toISOString().replace(/:/g, '.') + '.zip';
    };

    var hash2paths = function (relPath) {
      var paths = [];
      var names = relPath.split('/');
      var path = '#/';
      paths.push({name: 'Home', path: path});
      for (var i=0; i<names.length; ++i) {
        var name = names[i];
        if (name) {
          path = path + name + '/';
          paths.push({name: name, path: path});
        }
      }
      return paths;
    };

    var humanSize = function (size) {
      var hz;
      if (size < 1024) hz = size + ' B';
      else if (size < 1024*1024) hz = (size/1024).toFixed(2) + ' KB';
      else if (size < 1024*1024*1024) hz = (size/1024/1024).toFixed(2) + ' MB';
      else hz = (size/1024/1024/1024).toFixed(2) + ' GB';
      return hz;
    };

    var humanTime = function (timestamp) {
      var t = new Date(timestamp);
      return t.toLocaleDateString() + ' ' + t.toLocaleTimeString();
    };

    var setCurFiles = function (relPath) {
      $http.get('api' + relPath)
        .success(function (data) {
          var files = data;
          files.forEach(function (file) {
            file.relPath = relPath + encodeURIComponent(file.name);
            if (file.folder) file.relPath += '/';
            file.selected = false;
            file.humanSize = humanSize(file.size);
            file.humanTime = humanTime(file.mtime);
          });
          FM.curFiles = files;
          console.log('Current Files:');
          console.log(FM.curFiles);
        })
        .error(function (data, status) {
          alert('Error: ' + status + data);
        });
    };

    var handleHashChange = function (hash) {
      if (!hash) {
        return $location.path('/');
      }
      console.log('Hash change: ' + hash);
      var relPath = hash.slice(1);
      FM.curHashPath = hash;
      FM.curFolderPath = relPath;
      FM.curBreadCrumbPaths = hash2paths(relPath);
      setCurFiles(relPath);
    };

    $scope.$watch(function () {
      return location.hash;
    }, function (val) {
      handleHashChange(val);
    });

    // listening on file checkbox
    $scope.$watch('FM.curFiles|filter:{selected:true}', function (nv) {
      FM.selection = nv.map(function (file) {
        return file;
      });
    }, true);

    $scope.$watch('FM.selectAll', function (nv) {
      FM.curFiles.forEach(function (file) {
        file.selected = nv;
      });
    });

    $scope.$watch('FM.successData', function () {
      if (FM.successData === '__init__') return;
      $('#successAlert').show();
      $('#successAlert').fadeIn(3000);
      $('#successAlert').fadeOut(3000);
    });

    $scope.$watch('FM.errorData', function () {
      if (FM.errorData === '__init__') return;
      $('#errorAlert').show();
    });

