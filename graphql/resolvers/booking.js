const Event = require('../../models/event');
const Booking = require('../../models/booking');
const {transformEvent, transformBooking} = require('./merge');



module.exports = {

    booking: async () => {
        try {
            const bookings = await Booking.find();
            return bookings.map(booking => {
                return transformBooking(booking);
            });

        } catch (err) {
            throw err;
        }
    },
    bookEvent: async args => {
        try {
            const fetchedEvent = await Event.findOne({
                _id: args.eventId
            });
            const booking = new Booking({
                user: '5d61589462b8a8280cc9cb61',
                event: fetchedEvent

            });
            const result = await booking.save();
            return transformBooking(result);

        } catch (error) {
            throw error
        }
    },
    cancelBooking: async args => {
        try {
            const booking = await Booking.findById(args.bookingId).populate('event');
            const event = transformEvent(booking.event);
            await Booking.deleteOne({ _id: args.bookingId });
            return event;
        } catch (error) {
            throw error;
        }
    }

};