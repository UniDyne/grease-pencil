Date.extend({
	now: function() {
		return +(new Date);
	}
});

Date.implement({
	clone: function() {
		return new Date(this.getTime());
	},
	daysUntil: function (d) {
		return Math.ceil((d.getTime() - this.getTime()) / (1000*60*60*24));
	},
	addDays: function (n) {
		this.setDate(this.getDate() + n);
	}
});