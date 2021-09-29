const Location = require('../models/location');
const { createError } = require('../utils/error');

const Errors = (exports.Errors = {
	LocationNotFoundError: createError('LocationNotFoundError'),
});

exports.getLocations = async () => {
	return await Location.find();
};

exports.getLocation = async (_id) => {
	return await Location.findById(_id);
};

exports.createLocation = async ({ name, ui }) => {
	return await new Location({ name, ui }).save();
};

exports.updateLocation = async (_id, fields) => {
	const location = await Location.findById(_id).exec();

	if (!location) throw new Errors.UserNotFoundError();

	for (const key in fields) {
		location[key] = fields[key];
	}

	await location.save();

	return location;
};