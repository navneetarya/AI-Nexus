(function () {
  var saved = localStorage.getItem('ainexus-theme');
  var theme = saved === 'dark' || saved === 'light' ? saved : 'light';
  document.documentElement.setAttribute('data-theme', theme);
})();
