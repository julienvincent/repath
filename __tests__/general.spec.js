import repath from '../src'
import data from './data'
import _ from 'lodash'

const join = repath({
	schemas: {
		users: {
			__keys: ["owner", "friends", "overrideWithNull", "nullReference"]
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

const {users, dogs, ...parsedData} = join(data)

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

test('Only object type data should be mapped and pathed', () => {
	expect(parsedData.arrayInRoot).toEqual([1, 2])
	expect(parsedData.stringInRoot).toBe("3")
	expect(parsedData.numberInRoot).toBe(4)
	expect(parsedData.nullData).toBe(null)

	expect(parsedData.nestedData.a).toEqual([1, 2])
	expect(parsedData.nestedData.b).toBe("3")
	expect(parsedData.nestedData.c).toBe(4)
	expect(parsedData.nestedData.d.a).toEqual([1, 2])
	expect(parsedData.nestedData.e).toBe(null)
})

test("Multiple calls to getters should return the same value", () => {
	expect(users[1].dog).toEqual(users[1].dog)
})

test("References with null values should not attempt to resolve", () => {
	expect(dogs[1].nullReference).toEqual(null)
})