import repath from '../src'
import data from './data'
import _ from 'lodash'

test('users[1].animals to contain a dog and a cat', () => {
	const join = repath({
		schemas: {
			users: {
				__keys: ["owner", "friends"]
			},

			dogs: {
				__keys: ["dog"]
			}
		},
		unions: ["animals"]
	})

	const {users, dogs, cats} = join(data)

	expect(users[1].animals[0]).toMatchObject(_.omit(dogs[1], ["owner", "friends"]))
	expect(users[1].animals[1]).toMatchObject(_.omit(cats[1], ["owner"]))
})

test('users[2].animals to contain a dog and a cat (using reference inference)', () => {
	const join = repath({
		schemas: {
			users: {
				__keys: ["owner", "friends"]
			},

			dogs: {
				__keys: ["dog"]
			}
		},
		unions: ["animals"],
		inferReference: union => ({schema: union.schema || union.schemaProperty, id: union.id})
	})

	const {users, dogs, cats} = join(data)

	expect(users[2].animals[0]).toMatchObject(_.omit(dogs[2], ["owner"]))
	expect(users[2].animals[1]).toMatchObject(_.omit(cats[2], ["owner"]))
})