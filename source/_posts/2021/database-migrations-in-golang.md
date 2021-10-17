---
title: Database migrations in Golang.
date: 2021-11-10
permalink: database-migrations-in-golang/
cover: /images/2021/go-migrate-pexels-james-wheeler-1598075.jpg
---

During the development of an app, it's very common to do changes in the database schema, for a new feature you need to add a new table, add a new column to an existing table, alter the type of existing column or delete a column.

When you work alone you could do it manually, run the queries to alter the database schemas manually.

What happens when your team is not a one-person team? You need to share the queries to change the schema with your teammates, and they should know what changes they applied before to know if there are some new changes.

To simplify this task database migration tools were born. These tools do all this thing on behalf us.

Let see how the workflow with these tools works: 

* When a member of the team needs to change something in the schema, she/he creates a text file with the sentences to achieve the new schema.
* This file is usually stored in the repository, for example in a folder called `migrations`. if we also store it in the repository we can share easily and track changes (New files added, migration files should never be modified)
* When a new migration file is detected the migration tool will run and apply the changes to the database

Run the migration should be _idempotent_, that's that you can run it several times with the same migration files, and the final database schema must be the same. To achieve that usually, the migration tools store in a database table the last migration that ran ok and apply the new ones.


# go-migrate

[Go Migrate](https://github.com/golang-migrate/migrate) is a migration tool written in Golang. It can work as a CLI or as a Go library.

As a CLI tool, you can use it for projects *in any language*, not necessarily Go.

Go migrate read the migrations from a source, that they could be: files, GitHub Repo, Bitbucket, AWS S3, Google cloud storage, etc, and applies the changes in the database.

It supports several database types, but SQL and non-SQL, like _PostgreSQL_, MySQL, MongoDB, Clickhouse, Cassandra, etc... [See the complete list of supported databases](https://github.com/golang-migrate/migrate#databases).  

To track which migrations need to be applied, it stores the status in the database.  

## Installing go-migrate (CLI)
For Go 1.16+ just execute in your terminal
```bash
go install -tags 'postgres' github.com/golang-migrate/migrate/v4/cmd/migrate@latest
```

You can also download the binary from [here](https://github.com/golang-migrate/migrate/releases)

Check the [documentation](https://github.com/golang-migrate/migrate/tree/master/cmd/migrate) for more instructions

## Your first migration file
> In these examples I'm going to use Postgres as target database

Our goal is to get the database schema our app needs from the migration files.
The first migration file should create the tables we need.
Imagine we need a 'user' table.

We must create a file with the following name schema: `{version}_{title}.up.{extension}`, for example: `1_add_users_table.up.sql`, with the following content

```sql
CREATE SCHEMA common;
CREATE TABLE common.users(
  id SERIAL NOT NULL,
  name VARCHAR NOT NULL,  
  email VARCHAR UNIQUE NOT NULL,
  created_at TIMESTAMP NOT NULL DEFAULT NOW(),  
  PRIMARY KEY (id);
```

Then we can run migrate:

```bash
migrate -source file://migrations -database postgres://user:pass@localhost:5434/database up
```

Go migrate will check the last completed migration version and applies the following, in this case, we never run go migrate so will execute our file.

## Adding more migration files
Imagine that we need to add a new column, for example `age`. We will create a file with the name `2_add_age_to_users.up.sql` with content down below:

```sql
ALTER TABLE common.users ADD COLUMN age INT;  
```

Anyone in the team can run the migrate command again and get the new column.

if you run again the command, nothing happens because go-migrate knows all migration were applied.

You can execute go-migrate in a deployment pipeline like GitHub Action to put your database in the correct schema

One of the advantages of putting the schema updates in migration files, store them in the repo and run go-migrate in the deployment pipeline, is that the database schema can be synced with the app version. 
I mean, imagine you are working on a new feature in a new repo branch, you can define the migration files you need for this feature and commit them at the same time your code.
if your code is promoted to the main branch, when the code is deployed, the database update its schema 


## Migration rollback
go-migrate also allows us to do a migration rollback, that is a database query or queries to put the database schema as before run the equivalent up file.

In our example we can write the 'down' file for the second migration `2_add_age_to_users.up.sql` must have the name `2_add_age_to_users.down.sql` (the same name replacing `up` by `down`)

```sql
ALTER TABLE common.users DROP COLUMN age;
```
If we want to roll back to version 1 we must run:
```bash
migrate -source file://migrations -database postgres://user:pass@localhost:5434/database down 2
```

Down migration files are usually not written because usually can mean data loss.

[Taylor Otwell](https://twitter.com/taylorotwell?) the creator of [Laravel](https://laravel.com/) said in an interview:
> My view on that recently, in a past year, has been that you just never rollback. Ever. You would always go forward. Because I don’t know how you roll back without losing customer data. At least for my own projects like Forge or Envoyer, I could never really guarantee that I wasn’t losing data, so I think if at all possible, what I would try to do is write an entirely new migration that fixes whatever problem there is, and it would just migrate forward.

https://laraveldaily.com/still-need-migrations-taylor-says-no/

# Next steps
In this post, I talked about how to use _go-migrate_ as CLI but we can use it in our Golang programs. That it's very useful for example to run an integration test. I will write a post about how to manage integration's test in Go.

