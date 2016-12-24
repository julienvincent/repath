import repath from '../src'
import data from './data'
import _ from 'lodash'

const join = repath({
   schemas: {
      users: {
         __keys: ["owner", "friends"]
      },

      dogs: {
         __keys: ["dog"],
         friends: "dogs"
      }
   }
})

const {users, dogs} = join(data)

test('users[1].dog should match dogs[1]', () => {
   expect(users[1].dog).toMatchObject(_.omit(dogs[1], ["owner", "friends"]))
})

test('users[1].friends should contain an array of users', () => {
   expect(users[1].friends).toHaveLength(1)
   expect(users[1].friends[0]).toMatchObject(_.omit(users[2], ["friends", "dog", "animals"]))
})

test('dogs[1].friends should contain dogs[2] (override)', () => {
   expect(dogs[1].friends).toHaveLength(1)
   expect(dogs[1].friends[0]).toMatchObject(_.omit(dogs[2], ["owner"]))
})