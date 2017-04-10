import repath from '../src'
import data from './data'
import _ from 'lodash'

const join = repath({
	schemas: {
		users: {
			__keys: ["owner", "friends", "overrideWithNull"]
		},

		dogs: {
			__keys: ["dog", "noEntity", "noEntities"],
			friends: "dogs",
			overrideWithNull: null
		},

		noRoot: {
			__keys: ["noRoot"]
		}
	}
})

const {users, dogs, arrayInRoot, stringInRoot, numberInRoot} = join(data)

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

test('Parsing only users should not add getters to other entities', () => {
	const {users, dogs} = join(data, 'users')
	expect(Object.getOwnPropertyDescriptor(users[1], "dog").get).toBeTruthy()
	expect(dogs[1].owner).toBe(1)
})

test('Parsing only users and dogs should not add getters to other entities', () => {
	const {users, dogs, cats} = join(data, ['users', 'dogs'])
	expect(Object.getOwnPropertyDescriptor(users[1], "dog").get).toBeTruthy()
	expect(Object.getOwnPropertyDescriptor(dogs[1], "owner").get).toBeTruthy()
	expect(cats[1].owner).toBe(1)
})

test('Parsing a reference to a non existing root should do nothing.', () => {
	expect(users[1].noRoot).toBe(1)
})

test('Parsing a reference to a non existing entity should do nothing.', () => {
	expect(users[1].noEntity).toBe(3)

	expect(users[1].noEntities).toHaveLength(2)
	expect(users[1].noEntities).toContain(3)
	expect(users[1].noEntities).toContain(4)
})

test('Properties overridden with a "null" value should keep their initial value', () => {
	expect(dogs[1].overrideWithNull).toBe(data.dogs[1].overrideWithNull)
})

test('Properties not defined in schema should remain unchanged', () => {
	expect(users[1].name).toBe(data.users[1].name)
	expect(users[1].testArray).toBe(data.users[1].testArray)
	expect(users[1].testObject).toMatchObject(data.users[1].testObject)
})

test('Null properties should not be changed', () => {
	expect(users[1].nullValue).toBe(null)
})

test('Array type values in schema roots should not be touched', () => {
	expect(arrayInRoot).toEqual([1, 2])
})

test('String or number type values in schema roots should not be touched', () => {
	expect(stringInRoot).toBe("1")
	expect(numberInRoot).toBe(2)
})