---
title: "Integration test in Golang with dockertest "
date: 2021-11-9
permalink: integration-tests-in-golang-with-dockertest/
cover: /images/2021/dockertest-pexels-miguel-3785927.jpg
---

Do integration testing (or system testing) usually means to have a database populated with data, services like redis, elasticsearch, etc... working, In general, any infrastructure with which our software interacts.

The most common way to do it is to have a replica of our production infrastructure. Actually, it's relatively easy to achieve using containers, for example, docker containers. 

We can set up and run a container for every service we need to replicate, we can orchestrate it with docker-compose and create some makefiles or just a simple script to prepare the infrastructure and run the integration tests.

If your tests are independent (they should), you must find the way to "restart" the infrastructure services between tests, and this can be hard to get with a separated infrastructure setup and tests (the infra is set up in a script and the tests are in Go files) 

# dockertest
If you are using Golang, you can use [dockertest](https://github.com/ory/dockertest), a library with which you can manage and orchestrate the containers in your Go test files.

Manage the test infrastructure container from the Go files allow us to control which service we need in each test (for example, some package is using a database but not Redis, makes no sense to run the Redis for this test)

## Installing dockertest

To install _dockertest_, just run
```bash
go get -u github.com/ory/dockertest/v3
```

## Using dockertest 

The simplest way to set up the infrastructure with _dockertest_ is to add the setup code in the `TestMain` function in your test file.

`TestMain` is a function is called before running the tests in the package [More info](https://medium.com/goingogo/why-use-testmain-for-testing-in-go-dafb52b406bc)

This is an example of how to set up a MySQL service using _dockertest_
```go
package mypackage_test

import (
	"database/sql"
	"fmt"
	"log"
	"os"
	"testing"

	_ "github.com/go-sql-driver/mysql"
	"github.com/ory/dockertest/v3"
)

var db *sql.DB

func TestMain(m *testing.M) {
	// uses a sensible default on windows (tcp/http) and linux/osx (socket)
	pool, err := dockertest.NewPool("")
	if err != nil {
		log.Fatalf("Could not connect to docker: %s", err)
	}

	// pulls an image, creates a container based on it and runs it
	resource, err := pool.Run("mysql", "5.7", []string{"MYSQL_ROOT_PASSWORD=secret"})
	if err != nil {
		log.Fatalf("Could not start resource: %s", err)
	}

	// exponential backoff-retry, because the application in the container might not be ready to accept connections yet
	if err := pool.Retry(func() error {
		var err error
		db, err = sql.Open("mysql", fmt.Sprintf("root:secret@(localhost:%s)/mysql", resource.GetPort("3306/tcp")))
		if err != nil {
			return err
		}
		return db.Ping()
	}); err != nil {
		log.Fatalf("Could not connect to docker: %s", err)
	}

    // RESERVED FOR DATABASE MIGRATIONS    
        
	code := m.Run()
	
	// You can't defer this because os.Exit doesn't care for defer
	if err := pool.Purge(resource); err != nil {
		log.Fatalf("Could not purge resource: %s", err)
	}
	
	os.Exit(code)
}
```

## Populate database
Now we have the database service working, but this database is empty. _dockertest_ is using a generic MySQL image for the container and nothing related to our app is there. 

If you follow my posts, you would remember I wrote a post about {% post_link 2021/database-migrations-in-golang database migrations%} (if not you can take a look at it). In that post I talked about _go-migrate_ a tool to run database migrations but, in it, I focused on the usage as CLI tool, now we will use it in our Go code

In the previous code in the line where we wrote `// RESERVED FOR DATABASE MIGRATIONS` we will add this code

```go
    m, err := migrate.NewWithDatabaseInstance("file://<path-to-migration-folder>, "mysql", driver)
    if err != nil {
        log.Fatalf("Error running migrations: %s", err)
    }
    err = m.Up()
    if err != nil {
        log.Fatal(err.Error())
    }
```

Then after _dockertest_ ups the database, the migration tool populates the database and our integration tests can run with the same data in the database.

If the app has more than one package (that is the common situation), I put the services' setup code in an independent file which is called from every package:

```go
// it_utils.go
package it_utils

func IntegrationTestSetup() (*dockertest.Pool, *[]dockertestResource {
  // Setup the services
  //return the pool and the resources
}

func IntegrationTestTeardown(pool *dockertest.Pool, resources []*dockertest.Resource) {
	for _, resource := range resources {
		if err := pool.Purge(resource); err != nil {
			fmt.Printf("Could not purge resource: %s\n", err)
		}
	}
}
```

Then in each package's test we only need to add

```go
package my_package

func TestMyTests (t *testing.T) {
    if testing.Short() {
		t.Skip()
	}
	pool, resources := itutils.IntegrationTestSetup()
	defer itutils.IntegrationTestTeardown(pool, resources)
	
	t.Run("your test", func(t *testing.T) {
	...
	}
}

func TestOtherTests (t *testing.T) {
    if testing.Short() {
		t.Skip()
	}
	pool, resources := itutils.IntegrationTestSetup()
	defer itutils.IntegrationTestTeardown(pool, resources)
	
	t.Run("your other test", func(t *testing.T) {
	...
	}
}
```

Doing it in that way on every test block the service runs in a new container making the test completely independent.

As a last tip, I recommend putting the integration test in a different package to avoid circular imports.
