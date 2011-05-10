var deserializer = {
	restricted_ids: {},
	deserialize: function(data){
		var deser = ClassDeserializer;//here choose proper object

		idManager.max_id_number = toInt(serialized_data.max_id_number);
		deser.deserializeModels(data.models);
		deser.deserializeViews(data.views);
		viewManager.redrawAll();
	}

};
