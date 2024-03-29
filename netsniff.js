if (!Date.prototype.toISOString) {
    Date.prototype.toISOString = function () {
        function pad(n) { return n < 10 ? '0' + n : n; }
        function ms(n) { return n < 10 ? '00'+ n : n < 100 ? '0' + n : n }
        return this.getFullYear() + '-' +
            pad(this.getMonth() + 1) + '-' +
            pad(this.getDate()) + 'T' +
            pad(this.getHours()) + ':' +
            pad(this.getMinutes()) + ':' +
            pad(this.getSeconds()) + '.' +
            ms(this.getMilliseconds()) + 'Z';
    }
}

function createHAR(address, title, startTime, resources)
{
    var entries = [];

    resources.forEach(function (resource) {
        var request = resource.request,
            startReply = resource.startReply,
            endReply = resource.endReply;

        if (!request || !startReply || !endReply) {
            return;
        }

        entries.push({
            startedDateTime: request.time.toISOString(),
            time: endReply.time - request.time,
            request: {
                method: request.method,
                url: request.url,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: request.headers,
                queryString: [],
                headersSize: -1,
                bodySize: -1
            },
            response: {
                status: endReply.status,
                statusText: endReply.statusText,
                httpVersion: "HTTP/1.1",
                cookies: [],
                headers: endReply.headers,
                redirectURL: "",
                headersSize: -1,
                bodySize: startReply.bodySize,
                content: {
                    size: startReply.bodySize,
                    mimeType: endReply.contentType
                }
            },
            cache: {},
            timings: {
                blocked: 0,
                dns: -1,
                connect: -1,
                send: 0,
                wait: startReply.time - request.time,
                receive: endReply.time - startReply.time,
                ssl: -1
            }
        });
    });

    return {
        log: {
            version: '1.2',
            creator: {
                name: "PhantomJS",
                version: phantom.version.major + '.' + phantom.version.minor +
                    '.' + phantom.version.patch
            },
            pages: [{
                startedDateTime: startTime.toISOString(),
                id: address,
                title: title,
                pageTimings: {}
            }],
            entries: entries
        }
    };
}

var page = new WebPage();

if (phantom.args.length === 0) {

    console.log('Usage: netsniff.js <some URL>');
    phantom.exit();

} else {

    page.address = phantom.args[0];
    page.resources = [];

    page.onLoadStarted = function () {
        page.startTime = new Date();
    };

    page.onResourceRequested = function (req) {
        page.resources[req.id] = {
            request: req,
            startReply: null,
            endReply: null
        };
    };

    page.onResourceReceived = function (res) {
        if (res.stage === 'start') {
            page.resources[res.id].startReply = res;
        }
        if (res.stage === 'end') {
            page.resources[res.id].endReply = res;
        }
    };

    page.open(page.address, function (status) {

		var foolish; // transport object

        if (status !== 'success') {

            console.log('FAIL to load the address');

        } else {
			
			// Create HAR file
            page.title = page.evaluate(function () {
                return document.title;
            });

            foolish = createHAR(page.address, page.title, page.startTime, page.resources);

			// Create scripts collection
			foolish.scripts = page.evaluate(function() {
	            var list = document.querySelectorAll('script'), scripts = [], script, i;
    	        for (i = 0; i < list.length; i++) {
					script = list[i];
        	        scripts.push( (script.src === "") ? script.innerText : script.src );
            	}
	            return scripts;
    	    });

			// Create styles collection
			foolish.styles = {
				inline: page.evaluate(function() {
		            var list = document.querySelectorAll('style'), styles = [], style, i;
    		        for (i = 0; i < list.length; i++) {
						style = list[i];
						styles.push( style.innerText );
	            	}
		            return styles;
    		    }),
				linked: page.evaluate(function() {
		            var list = document.querySelectorAll('link'), links = [], link, i;
    		        for (i = 0; i < list.length; i++) {
						link = list[i];
						if (link.rel === "stylesheet") {
							links.push( link.href );
						}
	            	}
		            return links;
    		    })
			};

            console.log(JSON.stringify(foolish, undefined, 4));
        }
        phantom.exit();
    });
}
