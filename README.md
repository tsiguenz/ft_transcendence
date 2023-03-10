# ft_transcendence (42 project)

This project is about create a website where we can play [pong](https://en.wikipedia.org/wiki/Pong) with some friends. We used [nestjs](https://nestjs.com/), [vuejs](https://vuejs.org/), [postgresql](https://www.postgresql.org/), [pgadmin](https://www.pgadmin.org/), [nginx](https://www.nginx.com/) and [docker](https://www.docker.com/).
To run the project you need to modify the sample.env and rename it to '.env'.

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

(add testing rule)

---

<!-- TODO: remove in progress -->
## Architecture (in progress)

```mermaid

flowchart BT
	host[HOST]
	back(nestjs\nbackend)
	front(vuejs\nfrontend)
	db(posgres\ndatabase)
	pgadmin(pgadmin\nDBMS)
	vol_back[(backend)]
	vol_front[(frontend)]
	vol_db[(database)]

    pgadmin .- 80:5050 .-> host
    back .- 3030:3000 .-> host
    front .- 5173:8080 .-> host
	subgraph Docker network
		db & pgadmin & back & front
	end
	subgraph Docker volume
		vol_db <--> db
	end
	vol_back <--> back
	vol_back <--> host
	vol_front <--> front
	vol_front <--> host

```
