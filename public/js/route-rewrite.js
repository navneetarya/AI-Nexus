(function () {
  var p = window.location.search.slice(1);
  if (p && p.indexOf('p=') === 0) {
    var decoded = decodeURIComponent(p.slice(2));
    history.replaceState(null, '', decoded);
  }
})();
