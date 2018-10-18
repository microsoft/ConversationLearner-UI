/**
 * Copyright (c) Microsoft Corporation. All rights reserved.  
 * Licensed under the MIT License.
*/

const homePage = require('../../support/components/HomePage')

describe("URL Playground", () =>
{
  it('Parse URL', () =>
  {
    LogUrlProperties('http://localhost:5050/')
    LogUrlProperties('http://localhost:5050/home')
    LogUrlProperties('http://localhost:5050/home/5ae2cc3e-5d68-45b4-aa8c-9e539fca82b5')
    LogUrlProperties('http://localhost:5050/home/67b56e8d-7e0b-4bac-95d9-0de090ba3601/trainDialogs')
    LogUrlProperties('http://localhost:5050/home/67b56e8d-7e0b-4bac-95d9-0de090ba3601/trainDialogs?xyz=123')

    var uri = parseUri('http://localhost:5050/home/67b56e8d-7e0b-4bac-95d9-0de090ba3601/trainDialogs?xyz=123')
    var path = uri['path']
    var segments = path.split('/')
    segments.forEach(segment => { console.log(segment)})
  })
})

function LogUrlProperties(url)
{
  var uri = parseUri(url)

  var propertyList = ''
  for(var property in uri) propertyList += `${(propertyList.length == 0 ? '' : ', ')}${property}: ${uri[property]}`
  console.log(propertyList)  
}

function parseUri (str) {
	var	o   = parseUri.options,
		m   = o.parser[o.strictMode ? "strict" : "loose"].exec(str),
		uri = {},
		i   = 14;

	while (i--) uri[o.key[i]] = m[i] || "";

	uri[o.q.name] = {};
	uri[o.key[12]].replace(o.q.parser, function ($0, $1, $2) {
		if ($1) uri[o.q.name][$1] = $2;
	});

	return uri;
};

parseUri.options = {
	strictMode: false,
	key: ["source","protocol","authority","userInfo","user","password","host","port","relative","path","directory","file","query","anchor"],
	q:   {
		name:   "queryKey",
		parser: /(?:^|&)([^&=]*)=?([^&]*)/g
	},
	parser: {
		strict: /^(?:([^:\/?#]+):)?(?:\/\/((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?))?((((?:[^?#\/]*\/)*)([^?#]*))(?:\?([^#]*))?(?:#(.*))?)/,
		loose:  /^(?:(?![^:@]+:[^:@\/]*@)([^:\/?#.]+):)?(?:\/\/)?((?:(([^:@]*)(?::([^:@]*))?)?@)?([^:\/?#]*)(?::(\d*))?)(((\/(?:[^?#](?![^?#\/]*\.[^?#\/.]+(?:[?#]|$)))*\/?)?([^?#\/]*))(?:\?([^#]*))?(?:#(.*))?)/
	}
};
