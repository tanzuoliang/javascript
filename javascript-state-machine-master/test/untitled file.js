var StateMachine = require('../state-machine');
var myFSM = function() {
	this.counter = 42;
	this.startup();
};

myFSM.prototype = {
	onwarn: function() { this.counter++; }
}


var called = [];

StateMachine.create({
	target: myFSM.prototype,
	events: [
		{ name: 'startup', from: 'none',   to: 'green'  },
		{ name: 'warn',    from: 'green',  to: 'yellow' },
		{ name: 'panic',   from: 'yellow', to: 'red'    },
		{ name: 'clear',   from: 'yellow', to: 'green'  }
	],
	
	callbacks : {
		
		onbeforeevent: function(event,frmo,to) { called.push('onbefore(' + event + ')'); },
		onafterevent:  function(event,frmo,to) { called.push('onafter('  + event + ')'); },
		onleavestate:  function(event,from,to) { called.push('onleave('  + from + ')'); },
		onenterstate:  function(event,from,to) { called.push('onenter('  + to   + ')'); },
		onchangestate: function(event,from,to) { called.push('onchange(' + from + ',' + to + ')'); },
		// specific state callbacks
		onentergreen:  function() { called.push('onentergreen');     },
		onenteryellow: function() { called.push('onenteryellow');    },
		onenterred:    function() { called.push('onenterred');       },
		onleavegreen:  function() { called.push('onleavegreen');     },
		onleaveyellow: function() { called.push('onleaveyellow');    },
		onleavered:    function() { called.push('onleavered');       },

		// specific event callbacks
		onbeforewarn:  function() { called.push('onbeforewarn');     },
		onbeforepanic: function() { called.push('onbeforepanic');    },
		onbeforecalm:  function() { called.push('onbeforecalm');     },
		onbeforeclear: function() { called.push('onbeforeclear');    },
		onafterwarn:   function() { called.push('onafterwarn');      },
		onafterpanic:  function() { called.push('onafterpanic');     },
		onaftercalm:   function() { called.push('onaftercalm');      },
		onafterclear:  function() { called.push('onafterclear');     }
	}
});


var a = new myFSM();
//a.warn();
//setTimeout(()=>a.panic(), 100);

console.log(called);
