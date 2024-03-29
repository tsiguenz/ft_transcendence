all:
	./check_env_file.sh
	-docker compose up --build

detach:
	./check_env_file.sh
	-docker compose up -d --build

stop:
	-docker compose stop

down:
	-docker compose down --volumes

rma: down
	-docker system prune -af --volumes 2> /dev/null

re: down all

.PHONY: all detach stop down rma re
