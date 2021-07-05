const express = require("express");
const cors = require("cors");

const { v4 } = require("uuid");

const app = express();

app.use(cors());
app.use(express.json());

const users = [];

function checksExistsUserAccount(request, response, next) {
	const { username } = request.headers;

	const user = users.find((user) => user.username === username);

	if (!user) {
		return response.status(400).json({ error: "User not found!" });
	}

	request.user = user;

	next();
}

app.post("/users", (request, response) => {
	const { name, username } = request.body;

	const usernameTaken = !!users.find((user) => user.username === username);

	if (usernameTaken) {
		return response.status(400).json({ error: "Username taken!" });
	}

	const user = {
		id: v4(),
		name,
		username,
		todos: [],
	};

	users.push(user);

	return response.status(201).json(user);
});

app.get("/todos", checksExistsUserAccount, (request, response) => {
	const user = request.user;

	return response.json(user.todos);
});

app.post("/todos", checksExistsUserAccount, (request, response) => {
	const { title, deadline } = request.body;
	const user = request.user;

	const todo = {
		id: v4(),
		title,
		done: false,
		deadline: new Date(deadline),
		created_at: new Date(),
	};

	user.todos.push(todo);

	return response.status(201).json(todo);
});

app.put("/todos/:id", checksExistsUserAccount, (request, response) => {
	const { id } = request.params;
	const { title, deadline } = request.body;
	const user = request.user;

	const todo = user.todos.find((item) => item.id === id);

	if (!todo) {
		return response
			.status(404)
			.json({ error: "Todo with specified id not found" });
	}

	todo.title = title;
	todo.deadline = deadline;

	return response.json(todo);
});

app.patch("/todos/:id/done", checksExistsUserAccount, (request, response) => {
	const user = request.user;
	const { id } = request.params;

	const todo = user.todos.find((item) => item.id === id);

	if (!todo) {
		return response
			.status(404)
			.json({ error: "Todo with specified id not found" });
	}

	todo.done = true;

	return response.json(todo);
});

app.delete("/todos/:id", checksExistsUserAccount, (request, response) => {
	const user = request.user;
	const { id } = request.params;

	const todo = user.todos.find((item) => item.id === id);

	if (!todo) {
		return response
			.status(404)
			.json({ error: "Todo with specified id not found" });
	}

	user.todos = user.todos.filter((item) => item.id !== id);

	return response.status(204).json(user.todos);
});

module.exports = app;
