/* add some functions that Math should have had */

Math.extend({
	randRange: function(min, max) {
		return Math.floor(Math.random() * (max - min + 1) + min);
	},

	/* ensure number is within bounds */
	clamp: function(x, min, max) {
		return x < min ? min : x > max ? max : x;
	},

	/* return number a% between x and y */
	mix: function(x, y, a) {
		return x * (1-a) + y * a;
	},

	/* Heaviside step */
	step: function(e, x) {
		return x < e ? 0 : 1;
	},

	sigmoid: function(x) {
		return 1 / (1 + Math.pow(Math.E, x));
	},

	gauss: function(x) {
		return Math.pow(Math.E, -(x*x));
	}
});
