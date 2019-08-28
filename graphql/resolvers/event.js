const Event = require('../../models/event');
const { transformEvent } = require('./merge');

module.exports = {
    events: async () => {
        try {
            const events = await Event.find() // asyc event: GraphQl need to wait to finished           
                ;
            return events.map(event => {
                return transformEvent(event);
            });
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },
    createEvent: async (args, req) => {
        if (!req.isAuth) {
            throw new Error('Unauthenticated!');

        }
        const event = new Event({
            title: args.evenInput.title,
            description: args.evenInput.description,
            price: +args.evenInput.price,
            date: dateToString(args.evenInput.date),
            creator: '5d61589462b8a8280cc9cb61'
        });
        let createdEvent;
        try {
            const result = await event.save();
            createdEvent = transformEvent(result);

            const creator = await User.findById('5d61589462b8a8280cc9cb61') // dummy temp Id
                ;
            if (!creator) {
                throw new Error('User not found.');
            }
            creator.createdEvents.push(event); // associate the Event to the User
            await creator.save();
            return createdEvent;
        }
        catch (err) {
            console.log(err);
            throw err;
        }
    },

};