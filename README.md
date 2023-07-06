# ft_transcendence (42 project)

This project is about to create a website where we can play [pong](https://en.wikipedia.org/wiki/Pong) with some friends. We used [nestjs](https://nestjs.com/), [vuejs](https://vuejs.org/), [postgresql](https://www.postgresql.org/) and [docker](https://www.docker.com/).
To run the project you need to create .env file (can be created with set_env_file.sh script).

---

## Usage

Clone the project:
```$ git clone git@github.com:tsiguenz/ft_transcendence.git && cd ft_transcendence```

Build:
```$ make```

Stop the containers:
```$ make stop```

Delete the containers/volumes:
```$ make down```

Delete all the dockers elements (volumes/network/containers/images/cache):
```$ make rma```

Rebuilt (<=> make down + make):
```$ make re```

---

## Architecture (in progress)

```mermaid

flowchart BT
	host[HOST]
	back(nestjs\nbackend)
	front(vuejs\nfrontend)
	db(posgres\ndatabase)
	vol_back[(backend)]
	vol_front[(frontend)]
	vol_db[(database)]

    back .- 3030:3000 .-> host
    front .- 5173:8080 .-> host
	subgraph Docker network
		db & back & front
	end
	subgraph Docker volume
		vol_db <--> db
	end
	vol_back <--> back
	vol_back <--> host
	vol_front <--> front
	vol_front <--> host

```
