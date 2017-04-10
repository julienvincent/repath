export default {
	users: {
		1: {
			name: "User A",

			testArray: ["a", "b"],
			testObject: {a: "a", b: "b"},

			nullValue: null,

			dog: 1,
			friends: [2],
			noRoot: 1,
			noEntity: 3,
			noEntities: [3, 4],
			animals: [
				{schema: "dogs", id: 1},
				{schema: "cats", id: 1}
			]
		},
		2: {
			name: "User B",
			dog: 2,
			friends: [1],
			animals: [
				{schemaProperty: "dogs", id: 2},
				{schemaProperty: "cats", id: 2}
			]
		}
	},

	dogs: {
		1: {
			name: "Dog A",

			overrideWithNull: 1,

			owner: 1,
			friends: [2]
		},
		2: {
			name: "Dog B",
			owner: 2
		}
	},

	cats: {
		1: {
			name: "Cat A",
			owner: 1
		},
		2: {
			name: "Cat B",
			owner: 2
		}
	},

	arrayInRoot: [
		1, 2
	],

	stringInRoot: "1",
	numberInRoot: 2
}