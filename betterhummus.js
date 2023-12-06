var s4 = document.createElement('script');
s4.src = chrome.runtime.getURL('jquery.js');
s4.onload = function() { this.remove(); };

(document.head || document.documentElement).appendChild(s4);

var s = document.createElement('script');
s.src = chrome.runtime.getURL('3f86729896ed9c76b98a.js');
s.onload = function() { this.remove(); };

(document.head || document.documentElement).appendChild(s);

var s2 = document.createElement('script');
s2.src = chrome.runtime.getURL('8c3ff237e4512102354c.js');
s2.onload = function() { this.remove(); };

(document.head || document.documentElement).appendChild(s2);

var s3 = document.createElement('script');

s3.src = chrome.runtime.getURL('bootloader.js');
s3.onload = function() { this.remove(); };

(document.head || document.documentElement).appendChild(s3);

var s4 = document.createElement('link');

s4.rel = 'stylesheet';
s4.type = 'text/css';
s4.href = chrome.runtime.getURL('betterhummus.css');

(document.head || document.documentElement).appendChild(s4);