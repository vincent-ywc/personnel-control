// 获取url参数
function getParam(name) {
	var reg = new RegExp("(^|&)" + name + "=([^&]*)(&|$)", "i"); 
	  var r = window.location.search.substr(1).match(reg); 
	  if (r != null) return decodeURIComponent(r[2]); return null; 
}

// 时间格式化
var dateFormat = function() {
	var token = /d{1,4}|m{1,4}|yy(?:yy)?|([HhMsTt])\1?|[LloS]|"[^"]*"|'[^']*'/g,
		pad = function(val, len) {
			val = String(val);
			len = len || 2;
			while (val.length < len) {
				val = "0" + val;
			}
			return val;
		},
		masks = {
			"default": 'yyyy-mm-dd HH:MM:ss',
			"shortDate": 'm/d/yy',
			"shortTime": 'h:MM TT',
			"mediumTime": 'h:MM:ss TT',
			"longTime": 'h:MM:ss TT Z',
			"isoDate": 'yyyy-mm-dd',
			"isoTime": 'HH:MM:ss',
			"isoDateTime": 'yyyy-mm-dd\'T\'HH:MM:ss',
			"isoUtcDateTime": 'UTC:yyyy-mm-dd\'T\'HH:MM:ss\'Z\''
		};

	return function(date, mask, utc) {

		if (!(date instanceof Date)) {
			date = new Date(date);
		}

		if (isNaN(date)) {
			throw new SyntaxError("invalid date");
		}

		mask = masks[mask] || mask || masks["default"];

		var _ = utc ? "getUTC" : "get",
			d = date[_ + "Date"](),
			D = date[_ + "Day"](),
			m = date[_ + "Month"](),
			y = date[_ + "FullYear"](),
			H = date[_ + "Hours"](),
			M = date[_ + "Minutes"](),
			s = date[_ + "Seconds"](),
			L = date[_ + "Milliseconds"](),
			o = utc ? 0 : date.getTimezoneOffset(),
			flags = {
				d: d,
				dd: pad(d),
				m: m + 1,
				mm: pad(m + 1),
				yy: String(y).slice(2),
				yyyy: y,
				h: H % 12 || 12,
				hh: pad(H % 12 || 12),
				H: H,
				HH: pad(H),
				M: M,
				MM: pad(M),
				s: s,
				ss: pad(s),
				l: pad(L, 3),
				L: pad(L > 99 ? Math.round(L / 10) : L),
				t: H < 12 ? "a" : "p",
				tt: H < 12 ? "am" : "pm",
				T: H < 12 ? "A" : "P",
				TT: H < 12 ? "AM" : "PM",
				o: (o > 0 ? "-" : "+") + pad(Math.floor(Math.abs(o) / 60) * 100 + Math.abs(o) % 60, 4),
				S: ["th", "st", "nd", "rd"][d % 10 > 3 ? 0 : (d % 100 - d % 10 != 10) * d % 10]
			};

		return mask.replace(token, function($0) {
			return $0 in flags ? flags[$0] : $0.slice(1, $0.length - 1);
		});
	};
}();


// 模板引擎
var cache = {}
function bulidTmplFn(tmpl) {
	return new Function("obj",
		"var p=[];" +
		"with(obj){p.push('" +
		tmpl.replace(/[\r\t\n]/g, " ")
			.split("<%").join("\t")
			.replace(/((^|%>)[^\t]*)'/g, "typeof($1)==='undefined'?'':$1\r")
			.replace(/\t=(.*?)%>/g, "',(typeof($1)==='undefined'?'':$1),'")
			.split("\t").join("');")
			.split("%>").join("p.push('")
			.split("\r").join("\\'") +
		"');}return p.join('');"
	);
}
function template(selector, data) {
	var $tmpl,
		tmpl,
		fn;

	if (selector instanceof $) {
		$tmpl = selector;
		tmpl = $tmpl.html();
	} else if (typeof(selector) == "string") {

		if(selector.indexOf("<") == 0) {
			tmpl = selector;
		} else {
			$tmpl = $(selector);
			tmpl = $tmpl.html();
		}
	}

	fn = !/\W/.test(selector) ? (cache[selector] = cache[selector] || bulidTmplFn(tmpl)) : bulidTmplFn(tmpl);

	return data ? fn(data) : fn;
};