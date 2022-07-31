const { AuthenticationError } = require('apollo-server-express');
const { User } = require('../models');
const { signToken } = require('../utils/auth');

const resolvers = {
    Query: {
        me: async ( parent, args, context) => {
            if (context.user) {
                const userData = await User.findOne({})
                    .select('-__v -password')

                return userData;
            }
            throw new AuthenticationError('Not logged in!')
        }
    },
    Mutation: {
        login: async (parent, { email, password }) => {
            const user = await User.findOne({ email });

            if(!user) {
                throw new AuthenticationError('Incorrect Email')
            }

            const correctPW = await user.isCorrectPassword(password);

            if (!correctPW) {
                throw new AuthenticationError('Incorrect Password')
            }
            const token = signToken(user)
            return { token, user };
        },
        addUser: async (parent, args) => {
            const user = await User.create(args);
            const toekn = signToken(user)

            return { token, user };
        },
        saveBook: async (parent, { newBook }, context) => {
            if (context.user) {
                const updatedBook = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $push: { savedBook: newBook }},
                    { new: true } 
                );

                return updatedBook;
            }
            throw new AuthenticationError('Log in homie!')
        },
        removeBook: async (parent, { bookId }, context) => {
            if (context.user) {
                const updatedUser = await User.findByIdAndUpdate(
                    { _id: context.user._id },
                    { $pull: { savedBook: { bookId } } },
                    { new: true }
                )
                return updatedUser;
            }
            throw new AuthenticationError('Again Log in homie!')
        },
    }
}

module.exports = resolvers;