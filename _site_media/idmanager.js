var idManager = {
	max_id_number : 0,
	prefix: 'i',
	getNewId : function(obj, objType){
			this.max_id_number += 1;
			var tmp = document.getElementById(this.prefix + this.max_id_number);
			if(tmp){
				dbg('znalazlem !!');
				dbg(this.max_id_number);
			}
			return this.prefix + this.max_id_number;
		}
};

